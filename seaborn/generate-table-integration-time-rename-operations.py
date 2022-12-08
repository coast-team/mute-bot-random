import pandas as pd

df = pd.read_csv("../wip-results/integration-times-rename-post-optimisation.csv")

df.nbOpes = df.nbOpes.div(1000).astype(int)
df.time = df.time.div(1000000)

# Fix types' labels
df.loc[df.type == "local", "type" ] = "Local"
df.loc[df.type == "remote", "type" ] = "Direct remote"
df.loc[df.type == "winningConcurrentRemote", "type" ] = "Cc. int. greater epoch"
df.loc[df.type == "losingConcurrentRemote", "type" ] = "Cc. int. lesser epoch"

fns = [
    "mean",
    "median",
    lambda x: x.quantile(0.75) - x.quantile(0.25),
    lambda x: x.quantile(0.01),
    lambda x: x.quantile(0.99),
]
res = df.groupby(["type", "nbOpes"]).agg(fns)

res.rename(columns = {
    "mean": "Mean",
    "median": "Median",
    "<lambda_0>": "IQR",
    "<lambda_1>": '1st Quant.',
    "<lambda_2>": '99th Quant.',
    }, inplace = True)

pd.set_option('display.float_format', lambda x: '{:.0f}'.format(x) if x >= 1000 else '{:.3g}'.format(x))
# pd.set_option("display.precision", 0)

with open("table-integration-time-rename-operations-test.tex", "w") as f:
    f.write(res.to_latex())
