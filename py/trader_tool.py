# Libraries

import pandas as pd 
import numpy as np 
import copy
import tqdm as tq
from itertools import combinations

precision = 9

'''
Functions
'''
############################ RSX Function ############################
def FnV_function(f18,f20,v):
    """This is sub function for calculating the RSX.

    Args:
        f18 (float): This is a constant generated using frequency
        f20 (float): This is a constant generated using frequency
        v (np.array): Various differences of the price
    
    Returns:
        f_8 (np.array): The next iteration of RSX calculator
        f_0 (np.array): The next iteration of RSX calculator
    """
    length  = len(v)
    f_8     = np.zeros((length,))
    f_0     = np.zeros((length,))
    f_8[0]  = f18*v[0]
    f_0[0]  = f18*f_8[0]
    
    for i in range(1,length):
        f_8[i] = f18*v[i] + f20*f_8[i-1]
        f_0[i] = f18*f_8[i] + f20*f_0[i-1]

    return(f_8,f_0) 

############################ RSX Calculator ############################
def rsx(frequency, close):
    """This calculates the RSX given the frequency and the close price

    Args:
        frequency (int): the frequency you want to use
        close (pd.series): the closing prices of the stock

    Returns:
        RSX (np.array): the RSX values for the frequncy and closing prices
    """
    df = pd.DataFrame(close)
    df['f8'] = 100*df['close'] 
    v8 = df['f8'].diff().values
    v8[0] = df['f8'].iloc[0]
    # df = df.fillna(df["f8"].iloc[0])
    
    f18 = 3/(frequency+2)
    f20 = 1-f18
    
    f28, f30  = FnV_function(f18,f20,v8)
    vC = f28*1.5 - f30 * .5

    f38, f40  = FnV_function(f18,f20,vC)
    v10 = f38*1.5 - f40 * .5

    f48, f50  = FnV_function(f18,f20,v10)
    v14 = f48*1.5 - f50 * .5

    f58, f60  = FnV_function(f18,f20,abs(v8))
    v18 = f58*1.5 - f60 * .5

    f68, f70  = FnV_function(f18,f20,abs(v18))
    v1C = f68*1.5 - f70 * .5

    f78, f80  = FnV_function(f18,f20,abs(v1C))
    v20 = f78*1.5 - f80 * .5

    v4_       = (np.divide(v14[1:],v20[1:])+1)*50
    v4_       = np.append(50,v4_)
    v4_[0:5]  = 50

    rsx = np.clip(v4_,0,100)    
    return rsx

############################ Stochastic ############################
def stochastic_method(frequency, price):
    low = np.zeros((len(price),))
    high = np.ones((len(price),))

    for i in range(frequency, len(price)):  
      low[i] = min(price['low'].iloc[i-frequency:i])
      high[i] = max(price['high'].iloc[i-frequency:i])

    num = price['close']-low
    den = high - low


    stochastic = num.divide(den)*100
    stochastic_sma = stochastic.rolling(window=3).sum()
    stochastic_sma[:frequency] = 50
    
    return stochastic_sma.to_numpy()


############################ Drawdown and Runup ############################
def drawdown_runup(purchase_price, prices, drawdown_arr, runup_arr, short = False):
    prices = prices.to_numpy()
    if short:
      drawdown_arr  = np.append(drawdown_arr, purchase_price - np.amax(prices))
      runup_arr     = np.append(runup_arr, purchase_price - np.amin(prices))
    else:
      drawdown_arr  = np.append(drawdown_arr, np.amin(prices) - purchase_price )
      runup_arr     = np.append(runup_arr, np.amax(prices) - purchase_price)
    return drawdown_arr, runup_arr

############################ Profit and Cumalative profit ############################
def profit_loss(price_sold, price_bought, contracts, entry_com, exit_com, spec_prof_loss, wins, cum_profit):
  profit_loss = (price_sold-price_bought)*contracts - entry_com - exit_com
  
  if profit_loss > 0:
    spec_prof_loss[0] += profit_loss
    wins[0]           += 1
  else:
    spec_prof_loss[1] += profit_loss
    wins[1]           += 1
  
  cum_profit = np.append(cum_profit,cum_profit[-1]+profit_loss)
    
  # if short_bought:
  #   print("Short")
  # else:
  #   print("Long")
  # print("Price Bought: $", price_bought)
  # print("Contracts: ", contracts)
  # print("Price Sold: $", price_sold)
  # print("Profit: $", round(profit_loss,2))
  # print("\n")

  return spec_prof_loss, wins, cum_profit

############################ Entry Commission ############################
def entry_commission_cost(commission, capital, cost, type_com = "Reduce Contracts"):
  entry_com   = commission*capital
  cost       += entry_com
  if type_com == "Reduce Contracts":
    capital    -= entry_com    
  return entry_com, capital, cost

############################ Exit Commission ############################
def exit_commission_cost(commission, price_sold, price_bought, contracts, capital, cost, entry_com, type_com = "Reduced Contracts"):
  exit_com = contracts*price_bought*commission    # You pay commission on your inital capitalinvestment
  cost    += exit_com
  if type_com == "Reduce Contracts":
    capital += (price_sold - price_bought)*contracts - exit_com 
  elif type_com == "No Entry Change":
    capital += (price_sold - price_bought)*contracts - exit_com - entry_com
  
  return exit_com, cost, capital

################## Max Drawdown #########################
def maxdrawdown(cum_profit):

  cum_profit = cum_profit[1:]
  if len(cum_profit) < 2:
    return abs(min(cum_profit))
  cum_profit_2 = copy.deepcopy(cum_profit)
  cum_profit_2[cum_profit > 0] = 0
  max_drawdown = abs(min(cum_profit_2))
  
  for i in range(1,len(cum_profit)):
    drawdown = max(cum_profit[:i]) - cum_profit[i]
    if drawdown > max_drawdown:
      max_drawdown = drawdown
  
  return max_drawdown   

################## Calculating the Financial Metrics ##############################
def financial_metrics(profit_loss, cost, wins, bars, drawdown, runup, cum_profit):
  net_profit      = round(sum(profit_loss)-cost,precision)
  total_trades    = np.sum(wins)


  if total_trades > 1:
    min_of_drawdown = max(drawdown[1:])
    max_of_drawdown = min(drawdown[1:])
    avg_of_drawdown = np.mean(drawdown[1:])
    
    min_of_runup    = min(runup[1:])
    max_of_runup    = max(runup[1:])
    avg_of_runup    = np.mean(runup[1:])
  else:
    min_of_drawdown = np.nan
    max_of_drawdown = np.nan
    avg_of_drawdown = np.nan
    
    min_of_runup    = np.nan
    max_of_runup    = np.nan
    avg_of_runup    = np.nan


  
  if int(total_trades) == 0:
    avg_trade       = np.nan
    avg_bars        = np.nan
    perc_profitability  = np.nan
  else:
    avg_trade       = round(net_profit/total_trades,precision)
    avg_bars        = round(bars/total_trades,precision)
    perc_profitability  = round(wins[0]/total_trades,precision)

  
  if int(profit_loss[1]*wins[0]) == 0: 
    avg_win_loss        = np.nan
  else:
    avg_win_loss        = abs(round(profit_loss[0]*wins[1]/profit_loss[1]/wins[0],precision))

  if int(profit_loss[1]) == 0:
    profit_factor = np.NaN
  else:
    profit_factor = abs(profit_loss[0]/profit_loss[1])
  
  
  if total_trades < 1:
    max_drawdown = np.nan
    boomerang    = np.nan
  else:
    max_drawdown = maxdrawdown(cum_profit)
    if int(max_drawdown) == 0:
      boomerang = np.nan
    else:
      boomerang = net_profit/max_drawdown 
  
  output  = np.array([net_profit, total_trades, perc_profitability, avg_win_loss, avg_trade, 
            avg_bars, profit_factor, max_drawdown, boomerang, min_of_runup, 
             avg_of_runup, max_of_runup, min_of_drawdown, avg_of_drawdown, max_of_drawdown, [cum_profit]], dtype=object)

  
  return output


############################ All Trades Calculator ############################
def trade_triggers(Upper, Lower, rsx_full, initial_capital, prices, commission, type_of_commission = "Reduce Contracts", Close_position = True):
  ## Intialize 
  profit_loss_long   = np.zeros((2,))
  cost_long     = 0
  bars_long     = 0
  wins_long     = np.zeros((2,))
  runup_long    = np.array([0])
  drawdown_long = np.array([0])
  cum_pr_long   = np.array([0])

  profit_loss_short   = np.zeros((2,))
  cost_short      = 0
  bars_short      = 0
  wins_short      = np.zeros((2,))
  runup_short     = np.array([0])
  drawdown_short  = np.array([0])
  cum_pr_short    = np.array([0])

  invested      = False
  long_bought   = False 
  short_bought  = False


  capital       = initial_capital
  purchase_ind  = 0
  cum_profit    = np.array([0])
  
 
  ###################### Full Calculations #########################
  for i, rsx in enumerate(rsx_full):
    ########### Buy 1st long ############
    if rsx > Upper and not invested:
      price_long_bought = prices["close"].iloc[i]
      purchase_ind      = i
      # Entry Commission
      entry_com, capital, cost_long = entry_commission_cost(commission, capital, cost_long, type_com =  type_of_commission)
      contracts = capital / price_long_bought
      # Purchase complete
      invested    = True
      long_bought = True 

    ########## Sell 1st Short ##############
    if rsx < Lower and not invested:
      price_short_sold  = prices["close"].iloc[i]
      purchase_ind      = i
      # Enrty Commission
      entry_com, capital, cost_short = entry_commission_cost(commission, capital, cost_short,  type_com =  type_of_commission)
      contracts = capital / price_short_sold
      # Purchase complete
      invested     = True
      short_bought = True
      

    ################ Sell Long and Sell Short #################
    if invested and long_bought and rsx < Lower:
      ############## Long Sell ####################
      price_long_sold  = prices["close"].iloc[i]
      bars_long += i - purchase_ind + 1
      # Exit Commission
      exit_com, cost_long, capital = exit_commission_cost(commission, price_long_sold, 
                                                          price_long_bought, contracts, 
                                                          capital, cost_long, entry_com, 
                                                          type_com =  type_of_commission)          
      invested = False
      long_bought = False
      # Profit or Loss
      profit_loss_long, wins_long, cum_pr_long = profit_loss(price_long_sold, price_long_bought, 
                                                             contracts, entry_com, exit_com, 
                                                             profit_loss_long, wins_long, cum_pr_long)
      cum_profit = np.append(cum_profit,cum_pr_long[-1]-cum_pr_long[-2]+cum_profit[-1])
      # Drawdown and Runup
      drawdown_long, runup_long = drawdown_runup(price_long_bought, prices.iloc[purchase_ind:i+1,], drawdown_long, runup_long)            

      ############## Short Sell ##################
      price_short_sold = price_long_sold
      purchase_ind = i
      # Enrty Commission
      entry_com, capital, cost_short = entry_commission_cost(commission, capital, cost_short,  type_com =  type_of_commission)
      contracts = capital / price_short_sold
      # Purchase complete
      invested = True
      short_bought = True
      
    ############### Buy Short and buy Long #################
    if invested and short_bought and rsx > Upper:
      price_short_bought  = prices["close"].iloc[i]
      bars_short += i - purchase_ind + 1

      # Commission Exit
      exit_com, cost_short, capital = exit_commission_cost(commission, price_short_sold, 
                                                          price_short_bought, contracts, 
                                                          capital, cost_short, entry_com, 
                                                              type_com =  type_of_commission)          
      invested = False
      short_bought = False
      # Profit Loss
      profit_loss_short, wins_short, cum_pr_short = profit_loss(price_short_sold, price_short_bought, 
                                                          contracts, entry_com, exit_com, 
                                                          profit_loss_short, wins_short, cum_pr_short)
      cum_profit = np.append(cum_profit,cum_pr_short[-1]-cum_pr_short[-2]+cum_profit[-1])
      # Drawdown and Runup
      drawdown_short, runup_short = drawdown_runup(price_short_sold, prices.iloc[purchase_ind:i+1,], 
                                                      drawdown_short, runup_short, short=True)   

      ################# Buy Long ######################
      price_long_bought = price_short_bought
      purchase_ind = i
      # Entry Commission
      entry_com, capital, cost_long = entry_commission_cost(commission, capital, cost_long,  type_com =  type_of_commission)
      contracts = capital / price_long_bought
      # Purchase complete       
      invested    = True
      long_bought = True
  
  ####################### Close position ###########################
  if purchase_ind < i:
    if Close_position and long_bought:
      price_long_sold  = prices["close"].iloc[i]
      bars_long += i - purchase_ind + 1
      # Exit Commission
      exit_com, cost_long, capital = exit_commission_cost(commission, price_long_sold, 
                                                          price_long_bought, contracts, 
                                                          capital, cost_long, entry_com, 
                                                          type_com =  type_of_commission)          
      invested = False
      long_bought = False
      # Profit or Loss
      profit_loss_long, wins_long, cum_pr_long = profit_loss(price_long_sold, price_long_bought, 
                                                        contracts, entry_com, exit_com, 
                                                        profit_loss_long, wins_long, cum_pr_long)
      cum_profit = np.append(cum_profit,cum_pr_long[-1]-cum_pr_long[-2]+cum_profit[-1])
      # Drawdown and Runup
      drawdown_long, runup_long = drawdown_runup(price_long_bought, prices.iloc[purchase_ind:,], drawdown_short, 
                                                      runup_short)   
    elif Close_position and short_bought:
      price_short_bought  = prices["close"].iloc[i]
      bars_short += i - purchase_ind + 1

      # Commission Exit
      exit_com, cost_short, capital = exit_commission_cost(commission, price_short_sold, 
                                                            price_short_bought, contracts, 
                                                            capital, cost_short, entry_com,
                                                            type_com =  type_of_commission)          
      invested = False
      short_bought = False
      # Profit Loss
      profit_loss_short, wins_short, cum_pr_short = profit_loss(price_short_sold, price_short_bought, 
                                                        contracts, entry_com, exit_com, 
                                                        profit_loss_short, wins_short, cum_pr_short)
      cum_profit = np.append(cum_profit,cum_pr_short[-1]-cum_pr_short[-1]+cum_profit[-1])
      # Drawdown and Runup
      drawdown_short, runup_short = drawdown_runup(price_short_sold, prices.iloc[purchase_ind:,], drawdown_short, 
                                                      runup_short, short=True)   
      
  ####################### Return Data ##########################
  metr_short = financial_metrics(profit_loss_short, cost_short, wins_short, 
                                 bars_short, np.divide(drawdown_short,cum_pr_short+initial_capital), 
                                 np.divide(runup_short,cum_pr_short+initial_capital), cum_pr_short)
  
  metr_long  = financial_metrics(profit_loss_long, cost_long, wins_long, 
                                 bars_long, np.divide(drawdown_long,cum_pr_long+initial_capital), 
                                 np.divide(runup_long,cum_pr_long+initial_capital), cum_pr_long)
  
  drawdown_arr = np.append(np.divide(drawdown_short,cum_pr_short+initial_capital),np.divide(drawdown_long,cum_pr_long+initial_capital)[1:])
  runup_arr    = np.append(np.divide(runup_short,cum_pr_short+initial_capital),np.divide(runup_long,cum_pr_long+initial_capital) )
  metr_both    = financial_metrics(profit_loss_long+profit_loss_short, cost_long+cost_short, 
                                   wins_long+wins_short, bars_long+bars_short, 
                                   drawdown_arr, runup_arr, cum_profit) 
  
  # cum_dict = {"Both": cum_profit, "Long": cum_pr_long, "Short": cum_pr_long}
  return metr_both, metr_long, metr_short



############################ Upper and Lower finder ############################
def Upper_Lower_finder(freq_mode, df_factor):
    df_factor_frequency  = df_factor.loc[(df_factor['Frequency']==freq_mode)]
    Upper_mode  = df_factor_frequency['Upper'].mode()
    Upper_count = df_factor_frequency['Upper'].isin(Upper_mode).sum()/len(Upper_mode)

    Lower_mode  = df_factor_frequency['Lower'].mode()
    Lower_count = df_factor_frequency['Lower'].isin(Lower_mode).sum()/len(Lower_mode)

    # values = {freq_mode : {'Upper' : Upper_mode.values, 'Lower': Lower_mode.values}}

    return Upper_mode.values, Lower_mode.values, Upper_count, Lower_count


############################ Top Mode ############################    
def top_Mode(modes, series):
  top_index = len(series)
  top_mode = modes[0]
  
  for mode in modes:
    mode_index = series[series == mode].index[0]
    
    if mode_index < top_index:
      top_mode = mode
  
  return top_mode


############################ Median ############################    
def my_median(arr):
  arr = np.array(arr)
  if (len(arr) % 2) == 1:
    return np.median(arr)
  else:
    diffs = np.diff(arr)
    if diffs[0] > diffs[-1]:
      return np.median(arr[1:])
    else:
      return np.median(arr[:-1])


############################ Queries Options ############################ 
def automated_query(df, single_queries, single_quantile, double_quantile, final_sort, reduce_to = 10000):
  
  double_queries    = combinations(single_queries,2)
  freq_total_count  = dict.fromkeys(pd.unique(df['Frequency']),0)
  # Upper_total_count = dict.fromkeys(pd.unique(df['Upper']),0)
  # Lower_total_count = dict.fromkeys(pd.unique(df['Lower']),0)
  names             =["Query", "Total Count", "Reduced Count", "Frequency","Frequency Count", 
                    "Upper","Upper Count", "Lower","Lower Count", "All"]
  df_options_all    = pd.DataFrame(columns = names) 

  for query in single_queries:
    if query == "Stratergy Max Drawdown":
      boundary  = df[query].quantile(1-single_quantile)
      df_factor = df.loc[df[query] < boundary]
    else:
      boundary  = df[query].quantile(single_quantile)
      df_factor = df.loc[df[query] > boundary]
    intial_count = len(df_factor)
    reduced_count = intial_count
    if len(df) > reduce_to:
      if query == "Stratergy Max Drawdown":
        asc = True
      else:
        asc = False
      df_factor = df_factor.sort_values(by=[query],ascending=asc)
      df_factor = df_factor.head(reduce_to)
      reduced_count = len(df_factor)

    # 100 Percent
    freq_modes  = df_factor['Frequency'].mode()
    if len(freq_modes) > 0:
      freq_count  = df_factor['Frequency'].isin(freq_modes).sum()/len(freq_modes)
      for freq_mode in freq_modes:
        freq_total_count[freq_mode] += freq_count
        Upper_modes, Lower_modes, Upper_counts, Lower_counts = Upper_Lower_finder(freq_mode, df_factor)
        temp  = np.array([query + ': ' + str(round(boundary,2)), intial_count, reduced_count, 
                          freq_mode, freq_count, my_median(Upper_modes), Upper_counts, 
                          my_median(Lower_modes), Lower_counts, 
                          'Upper: '+ str(Upper_modes) + ' and Lower:' + str(Lower_modes)])
        df_options_all = df_options_all.append(pd.DataFrame(temp.reshape(1,10), columns = names), 
                          ignore_index=True)


  for query in double_queries:
    if query[0] == "Stratergy Max Drawdown":
      boundary1 = df[query[0]].quantile(1- double_quantile)
      boundary2 = df[query[1]].quantile(double_quantile)
      df_factor = df.loc[(df[query[0]] < boundary1) & (df[query[1]] > boundary2)]
    elif query[1] == "Stratergy Max Drawdown":
      boundary1 = df[query[0]].quantile(double_quantile)
      boundary2 = df[query[1]].quantile(1 - double_quantile)
      df_factor = df.loc[(df[query[0]] > boundary1) & (df[query[1]] < boundary2)]
    else:
      boundary1 = df[query[0]].quantile(single_quantile)
      boundary2 = df[query[1]].quantile(single_quantile)
      df_factor = df.loc[(df[query[0]] > boundary1) & (df[query[1]] > boundary2)]    

    intial_count = len(df_factor)
    reduced_count = intial_count
    if len(df) > reduce_to:
      if "Max Drawdown" in query:
        asc = True
      else:
        asc = False
      df_factor = df_factor.sort_values(by=[final_sort],ascending=asc)
      df_factor = df_factor.head(reduce_to)
      reduced_count = len(df_factor)

    # 100 Percent
    freq_modes  = df_factor['Frequency'].mode()
    if len(freq_modes) > 0:
      freq_count  =  df_factor['Frequency'].isin(freq_modes).sum()/len(freq_modes)
      for freq_mode in freq_modes:
        freq_total_count[freq_mode] += freq_count
        Upper_modes, Lower_modes, Upper_counts, Lower_counts = Upper_Lower_finder(freq_mode, df_factor)
        temp  = np.array([query[0]+': '+str(round(boundary1,2))+' and '+query[1]+': '+str(round(boundary2,2)), 
                          intial_count, reduced_count,freq_mode, freq_count, my_median(Upper_modes), 
                          Upper_counts, my_median(Lower_modes), Lower_counts,
                          'Upper: '+ str(Upper_modes) + ' and Lower:' + str(Lower_modes)])
        df_options_all = df_options_all.append(pd.DataFrame(temp.reshape(1,10), columns = names), 
                          ignore_index=True)
        
  df_options_all["Frequency"] = df_options_all["Frequency"].astype(float)
  df_options_all["Upper"]     = df_options_all["Upper"].astype(float)
  df_options_all["Lower"]     = df_options_all["Lower"].astype(float)
  return df_options_all   


############################ Simple Query ############################ 
def simple_query(df, query, boundary, sorting_params, reduce):
  names =["Sort by", "Total Count", "Frequency","Frequency Count", 
          "Upper","Upper Count", "Lower","Lower Count", "All"]
  df_options_all  = pd.DataFrame(columns = names)
  
  if query == "Stratergy Max Drawdown":
      df_factor = df.loc[df[query] < boundary]
      asc = True
  else:
      df_factor = df.loc[df[query] > boundary]
      asc = False
  
  intial_count = len(df_factor)

  for sort_param in sorting_params:
    if len(df_factor) > reduce:
      df_reduced = df_factor.sort_values(by = [sort_param, sorting_params[0]], ascending = [asc, False]).head(reduce)
    else:
      df_reduced = df_factor.sort_values(by = [sort_param, sorting_params[0]], ascending = [asc, False])
      reduce     = len(df_factor)
    
    freq_reduce_mode  = df_reduced['Frequency'].mode()
    freq_reduce_count = df_reduced['Frequency'].isin(freq_reduce_mode).sum()/len(freq_reduce_mode)

    # for frequency in freq_reduce_mode:
    frequency = df_reduced['Frequency'].iloc[0]
    Upper_modes, Lower_modes, Upper_counts, Lower_counts = Upper_Lower_finder(frequency, df_reduced)
    df_factor_frequency  = df_reduced.loc[(df_reduced['Frequency']==frequency)]
    Upper_mode = top_Mode(Upper_modes, df_factor_frequency['Upper'])
    Lower_mode = top_Mode(Lower_modes, df_factor_frequency['Lower'])
    
    temp  = np.array([sort_param,intial_count, frequency, freq_reduce_count, 
                    Upper_mode, Upper_counts, Lower_mode, Lower_counts, 
                    'Upper: '+ str(Upper_modes) + ' and Lower:' + str(Lower_modes)])
    
    df_options_all = df_options_all.append(pd.DataFrame(temp.reshape(1,9), columns = names), ignore_index=True)
    
  return df_options_all
  
  
  
  
  
############################ Testing Options ############################ 
def test_options(df_options, prices, intial_capital, commission, names, type_opt):
  results_df = pd.DataFrame(0, columns=names, index=np.arange(len(df_options)))
  loop_variables = zip(df_options['Frequency'].values, df_options['Upper'].values, 
                      df_options['Lower'].values)
  
  for j, (frequency, Upper, Lower) in enumerate(loop_variables):
    
    rsx_full = rsx(frequency, prices['close'])
    metr_both, metr_long, metr_short = trade_triggers(Upper, Lower, rsx_full, intial_capital, 
                                                      prices, commission) #type_of_commission = "Reduce Contracts", 
                                                          # Close_position = True)
    
    if type_opt == "Long":
      results_df.iloc[j]   = np.append([frequency, Upper, Lower],metr_long)
    elif type_opt == "Short":
      results_df.iloc[j]   = np.append([frequency, Upper, Lower],metr_short)
    elif type_opt == "Both":
      results_df.iloc[j]   = np.append([frequency, Upper, Lower],metr_both)
  
  return results_df
