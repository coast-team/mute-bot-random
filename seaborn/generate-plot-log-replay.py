import pandas as pd
import matplotlib
import matplotlib.patches as patches
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

sns.set()
sns.set_context("paper", font_scale=1.5)
sns.set_style("whitegrid")

defaultPal = sns.color_palette()
blue = defaultPal[0]
red = defaultPal[3]
green = defaultPal[2]
orange = defaultPal[1]
violet = defaultPal[4]

# sns.color_palette(["orange","blue","green","red","purple"])

palette = {"LS": orange, "RLS-30k-1rb": blue, "RLS-30k-2rb": green, "RLS-30k-3rb": red, "RLS-30k-4rb": violet}

df = pd.read_csv("../wip-results/log-execution-time-2021-12-13.csv")

df.nbOpes = df.nbOpes.div(1000)
df.nbOpes = df.nbOpes.astype(int)
df["time"] = df["time"].div(1000000000)
# df = df.loc[df["nbOpes"] <= 50]

for frequency in ["30k"]:
    labels = ["LogootSplit"] + ["RLS-" + frequency + "-" + str(i) + "rb" for i in range(1,5)]
    options = ["LS"] + ["RLS-" + frequency + "-" + str(i) + "rb" for i in range(1,5)]
    currentDF = df.loc[df["type"].isin(options)]

    res = sns.relplot(x="nbOpes", y="time", style="type", hue="type", data=currentDF, errorbar=None, kind="line",  hue_order=options, palette=palette, legend=False, aspect=2)

    res.set_axis_labels("Nb of ops (thousands)", "Time (s)")
    plt.legend(labels=labels, ncol=5, loc='upper left', bbox_to_anchor=(-0.03, -0.15), edgecolor="1")
    plt.tight_layout()

    # plt.show()

    res.fig.savefig("../wip-results/replay-log-" + frequency + "-2022-10-27-test.pdf", format="pdf", transparent="True")
