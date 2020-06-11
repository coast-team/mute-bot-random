import pandas
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

sns.set()
sns.set_context("paper", font_scale=1.2)
sns.set_style("whitegrid")

white = "#f7f7f7"
darkBlue = "#2171b5"
lightOrange = "#fdae61"

order = ["remote", "remoteWithRename", "remoteConcurrentToRename"]
labels = ["LogootSplit", "RenamableLogootSplit", "concurrent op to\nrename op"]
palette = {
    "remote": lightOrange,
    "remoteWithRename": darkBlue,
    "remoteConcurrentToRename": white
}

df = pandas.read_csv("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/integration-times/integration-times-2020-01-07.csv")

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df.time = df.time.div(1000)

# Keep only remote operations
df = df.loc[(df.nbOpes % 10 == 0) & ((df.type == "remote") | (df.type == "remoteWithRename") | (df.type == "remoteConcurrentToRename"))]

res = sns.catplot(x="nbOpes", y="time", hue="type", kind="box", fliersize=0, data=df, hue_order=order, palette=palette, legend=False)
res.set_axis_labels("Number of operations (thousands)", "Integration time (µs)")
res.set(ylim=(0, 650))

res.ax.axvline(2.27, ymin=0, ymax=0.35, color="gray", linestyle="--")
res.ax.axvline(2.27, ymin=0.52, ymax=1, color="gray", linestyle="--")
res.ax.axvline(5.27, ymin=0, ymax=0.35, color="gray", linestyle="--")
res.ax.axvline(5.27, ymin=0.46, ymax=1, color="gray", linestyle="--")
res.ax.axvline(8.27, ymin=0, ymax=0.35, color="gray", linestyle="--")
res.ax.axvline(8.27, ymin=0.47, ymax=1, color="gray", linestyle="--")
res.ax.axvline(11.27, ymin=0, ymax=0.35, color="gray", linestyle="--")
res.ax.axvline(11.27, ymin=0.45, ymax=1, color="gray", linestyle="--")
res.ax.axvline(14.27, ymin=0, ymax=0.34, color="gray", linestyle="--")
res.ax.axvline(14.27, ymin=0.45, ymax=1, color="gray", linestyle="--")

handles, _ = res.ax.get_legend_handles_labels()
res.ax.legend(handles=handles, labels=labels, loc="lower center", ncol=2)

res.fig.savefig("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/figures/integration-time-boxplot-remote-operations-without-outliers.pdf", format="pdf", transparent="True", bbox_inches="tight")

