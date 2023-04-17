import pandas as pd
import matplotlib.pyplot as plt

# Load the data from a CSV file
data = pd.read_csv('11.csv')

# Plot the data using matplotlib
plt.plot(data['time'], data['open'])
plt.title('TradingView Example')
plt.xlabel('time')
plt.ylabel('open')
plt.show()