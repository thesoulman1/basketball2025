import pandas as pd

# Read the Excel file
df = pd.read_excel('basketball2025_final.xlsx')

# Display basic info
print("Column names:")
print(df.columns.tolist())
print("\nFirst 10 rows (Name and Fantasy Points Per Game):")
print(df[['PLAYER', 'Fantasy Points Per Game', 'Games Played']].head(10))
print("\nData types:")
print(df.dtypes)
print("\nShape:", df.shape)

# Check if sorted by FPG
print("\nIs sorted by Fantasy Points Per Game (descending)?")
is_sorted = df['Fantasy Points Per Game'].is_monotonic_decreasing
print(f"Answer: {is_sorted}")

if not is_sorted:
    print("\nNeed to sort by Fantasy Points Per Game!")
    print("Top 10 by Fantasy Points Per Game:")
    print(df.nlargest(10, 'Fantasy Points Per Game')[['PLAYER', 'Fantasy Points Per Game', 'Games Played']])
