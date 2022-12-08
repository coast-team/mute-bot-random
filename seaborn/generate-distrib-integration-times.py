import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("../wip-results/log-stats-per-operation-2021-12-13.csv")
df = df.loc[df.type != "rename"]

df.time = df.time.div(1000).astype(int)

cols = ["time"] # one or more

Q1 = df[cols].quantile(0.25)
Q3 = df[cols].quantile(0.75)
IQR = Q3 - Q1

df = df[~((df[cols] < (Q1 - 1.5 * IQR)) |(df[cols] > (Q3 + 1.5 * IQR))).any(axis=1)]

res = sns.catplot(kind="boxen", x="type", y="time", col="CRDT", data=df)

res.fig.savefig("../wip-results/distrib-integration-times-without-outliers.pdf", format="pdf", transparent=True)
