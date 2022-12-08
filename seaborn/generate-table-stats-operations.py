import pandas as pd

df = pd.read_csv("../wip-results/log-stats-per-operation-2021-12-13.csv")

del df["nbOpes"]

# Fix types' labels
df.loc[df.CRDT == "LS$", "CRDT" ] = "LS"
df.loc[df.CRDT == "RLS-7k5$", "CRDT" ] = "RLS - 7.5k"
df.loc[df.CRDT == "RLS-30k$", "CRDT" ] = "RLS - 30k"

# Adjust units
df.loc[df.type != "rename", "time"] = df.loc[df.type != "rename", "time"].div(1000)
df.loc[df.type == "rename", "time"] = df.loc[df.type == "rename", "time"].div(1000000)
df.loc[df.type == "rename", "opSize"] = df.loc[df.type == "rename", "opSize"].div(1000)

fns = [
    "mean",
    "median",
    lambda x: x.quantile(0.75) - x.quantile(0.25),
    lambda x: x.quantile(0.01),
    lambda x: x.quantile(0.99),
]
res = df.groupby(["type", "CRDT"]).agg(fns)

res.rename(columns = {
    "mean": "Mean",
    "median": "Median",
    "<lambda_0>": "IQR",
    "<lambda_1>": '1st Quant.',
    "<lambda_2>": '99th Quant.',
    }, inplace = True)

pd.set_option('display.float_format', lambda x: '{:.0f}'.format(x) if x >= 1000 else '{:.3g}'.format(x))

with open("table-stats-per-operations-test.tex", "w") as f:
    f.write(res.to_latex())
