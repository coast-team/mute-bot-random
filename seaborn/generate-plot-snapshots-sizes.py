import pandas as pd
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
labels = ["content", "LogootSplit", "RLS with GC", "RLS w/o GC"]
palette = {"content": blue, "ls": red, "rlsWithGC": green, "rlsWithoutGC": orange}

df = pd.read_csv("../wip-results/snapshot-sizes.csv")

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df["size"] = df["size"].div(1000)

res = sns.relplot(x="nbOpes", y="size", hue="type", style="type", data=df, kind="line", col="nbRenamingBots", col_wrap=2, hue_order=orders, palette=palette, legend=False)

res.set(yscale="log")
res.set_axis_labels("Nb of ops (thousands)", "Size (KB)")
res.set_titles("{col_name} renaming bots")
res.add_legend(labels=labels, bbox_to_anchor=(1, 0.64))

for ax in res.axes:
    ax.text(7, 29000, "Phase 1", fontsize=16)
    ax.text(105, 29000, "Phase 2", fontsize=16)
    ax.axvline(100, color="gray", linestyle="--")

res.fig.savefig("../wip-results/snapshot-sizes.pdf", format="pdf", transparent="True")
