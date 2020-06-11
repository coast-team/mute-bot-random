import pandas
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

sns.set()
sns.set_context("paper", font_scale=1.2)
sns.set_style("whitegrid")

darkBlue = "#2171b5"
lightOrange = "#fdae61"

order = ["local", "localWithRename"]
labels = ["LogootSplit", "RenamableLogootSplit"]
palette = {"local": lightOrange, "localWithRename": darkBlue}

df = pandas.read_csv("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/integration-times/integration-times-2020-01-07.csv")

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df.time = df.time.div(1000)

# Keep only local operations
df = df.loc[(df.nbOpes % 10 == 0) & ((df.type == "local") | (df.type == "localWithRename"))]

res = sns.catplot(x="nbOpes", y="time", hue="type", kind="box", fliersize=0, data=df, hue_order=order, palette=palette, legend=False)

res.set_axis_labels("Number of operations (thousands)", "Integration time (µs)")
res.set(ylim=(0, 300))

res.ax.axvline(2.5, color="gray", linestyle="--")
res.ax.axvline(5.5, color="gray", linestyle="--")
res.ax.axvline(8.5, color="gray", linestyle="--")
res.ax.axvline(11.5, color="gray", linestyle="--")

handles, _ = res.ax.get_legend_handles_labels()
res.ax.legend(handles=handles, labels=labels, loc="lower center", ncol=2)

res.fig.savefig("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/figures/integration-time-boxplot-local-operations-without-outliers.pdf", format="pdf", transparent=True, bbox_inches="tight")

