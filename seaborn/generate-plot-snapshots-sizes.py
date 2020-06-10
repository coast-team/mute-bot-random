import pandas
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

sns.set()
sns.set_context("poster")
sns.set_style("whitegrid")

defaultPal = sns.color_palette()
blue = defaultPal[0]
red = defaultPal[3]
green = defaultPal[2]
orange = defaultPal[1]

orders = ["content", "ls", "rlsWithGC", "rlsWithoutGC"]
labels = ["content", "LogootSplit", "RenamableLogootSplit with GC", "RenamableLogootSplit w/o GC"]
palette = {"content": blue, "ls": red, "rlsWithGC": green, "rlsWithoutGC": orange}

df = pandas.read_csv("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/snapshots/snapshot-sizes.csv")

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df["size"] = df["size"].div(1000)

res = sns.relplot(x="nbOpes", y="size", hue="type", style="type", data=df, kind="line", aspect=1.5, hue_order=orders, palette=palette, legend=False)
res.set_axis_labels("Number of operations (thousands)", "Size (KB)")
res.set(yscale="log")

res.ax.text(7, 30000, "Phase 1", fontsize=18)
res.ax.text(105, 30000, "Phase 2", fontsize=18)
res.ax.axvline(100, color="gray", linestyle="--")
res.ax.legend(labels=labels, bbox_to_anchor=(1, 0.75), frameon=False)

res.fig.savefig("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/figures/snapshots-sizes.pdf", format="pdf", transparent="True", bbox_inches="tight")
