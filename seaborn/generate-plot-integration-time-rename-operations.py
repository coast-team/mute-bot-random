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
orange = defaultPal[1]

orders = ["local", "remote"]
labels = orders
palette = {"local": blue, "remote": orange}

df = pandas.read_csv("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/integration-times/integration-times-rename-op/sample-0/integration-times-rename-op-full.csv")

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df.time = df.time.div(1000000)

res = sns.relplot(x="nbOpes", y="time", hue="type", style="type", kind="line", data=df, aspect=1.4, hue_order=orders, palette=palette, legend=False)
res.set_axis_labels("Number of operations (thousands)", "Integration time (ms)")

res.ax.text(7, 1350, "Phase 1", fontsize=18)
res.ax.text(105, 1350, "Phase 2", fontsize=18)
res.ax.axvline(100, color="gray", linestyle="--")
res.ax.legend(labels=labels, bbox_to_anchor=(1, 0.75), frameon=False)

res.fig.savefig("../results/150k-op-10-nodes-80-20-until-60k-char-then-50-50/figures/integration-time-rename-op.pdf", format="pdf", transparent="True", bbox_inches="tight")

