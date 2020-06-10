import pandas
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

sns.set()
sns.set_context("poster", font_scale=1.4)
sns.set_style("whitegrid")

darkBlue = "#2171b5"
lightOrange = "#fdae61"

colors = [lightOrange, darkBlue]
sns.set_palette(sns.color_palette(colors))

df = pandas.read_csv("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/snapshots/snapshot-sizes.csv")

df = df[(df.type == "ls") | (df.type == "content")]
df = df[df.nbOpes == 100000]

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df["size"] = df["size"].div(1000000)

mapFn = lambda x: "LogootSplit" if x == "ls" else x
df["type"] = df["type"].map(mapFn)

res = sns.catplot(x="nbOpes", y="size", hue="type", data=df, kind="bar", dodge=False, legend_out=False, height=7, aspect=1.2)
res.set(yscale="log")
res.set_axis_labels("Number of operations (thousands)", "Size (MB)")

# res = sns.catplot(x="size", y="nbOpes", hue="type", data=df, kind="bar", dodge=False, legend_out=False, orient="h", height=7, aspect=1.5)
# res.set(xscale="log")
# res.set_axis_labels("Size (Mo)", "Number of operations (thousands)")

res.fig.savefig("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/figures/overhead-size.pdf", format="pdf", transparent="True", bbox_inches="tight")


