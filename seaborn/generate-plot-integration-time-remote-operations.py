import pandas as pd
import matplotlib
import matplotlib.patches as patches
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

sns.set()
sns.set_context("paper", font_scale=1.2)
sns.set_style("whitegrid")

white = "#f7f7f7"
darkBlue = "#2171b5"
lightOrange = "#fdae61"
red = sns.color_palette()[3]

order = ["remoteLS", "remoteRLS", "remoteRLSFromPreviousEpoch", "remoteRLSFromConcurrentEpoch"]
labels = [
    "LS",
    "RLS",
    "From previous epoch (RLS only)",
    "From concurrent epoch (RLS only)"
]
palette = {
    "remoteLS": lightOrange,
    "remoteRLS": darkBlue,
    "remoteRLSFromPreviousEpoch": white,
    "remoteRLSFromConcurrentEpoch": red
}

df = pd.read_csv("../wip-results/integration-times-insert-op.csv")

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df.time = df.time.div(1000)

# Keep only remote operations
df = df.loc[
    (df.type == "remoteLS") |
    (df.type == "remoteRLS") |
    (df.type == "remoteRLSFromPreviousEpoch") |
    (df.type == "remoteRLSFromConcurrentEpoch")
]

res = sns.catplot(x="nbOpes", y="time", hue="type", kind="box", fliersize=0, data=df, hue_order=order, palette=palette, legend=False, aspect=1.4)
res.set_axis_labels("Number of operations (thousands)", "Integration time (µs)")
res.set(ylim=(0, 650))

for i in range(5):
    res.ax.add_patch(patches.Rectangle((2 + 3 * i, 0), 0.5, 600, color='gray', alpha=0.3, zorder=-1))

handles, _ = res.ax.get_legend_handles_labels()
res.ax.legend(handles=handles, labels=labels, loc="lower center", ncol=2)

plt.show()

# res.fig.savefig("../wip-results/integration-time-boxplot-remote-operations-without-outliers.pdf", format="pdf", transparent="True", bbox_inches="tight")

