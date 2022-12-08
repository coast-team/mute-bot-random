import sys, getopt

import pandas as pd
import matplotlib
import matplotlib.patches as patches
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

def main(argv):
    sns.set()

    # Settings pour 1 plot
    # sns.set_context("paper", font_scale=1.5)

    # Settings pour 4 plots alignés
    sns.set_context("talk", font_scale=1.2)

    sns.set_style("whitegrid")
    default_pal = sns.color_palette()
    blue = default_pal[0]
    red = default_pal[3]
    green = default_pal[2]
    orange = default_pal[1]

    orders = ["content", "ls", "rlsWithGC", "rlsWithoutGC"]
    labels = ["content", "LogootSplit", "RLS with GC", "RLS w/o GC"]
    palette = {"content": blue, "ls": red, "rlsWithGC": green, "rlsWithoutGC": orange}

    dry_run = False

    df = pd.read_csv("../wip-results/snapshot-sizes.csv")

    try:
        opts, args = getopt.getopt(argv, "m:n",["mode=","--dry-run"])
    except getopt.GetoptError:
        print("generate-plot-snapshots-sizes.py -m <ls | rlsGC | all> -n")
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-m", "--mode") and arg in "ls":
            orders = ["content", "ls"]
            labels = ["content", "LogootSplit"]
            palette = {"content": blue, "ls": red}
            df = df[(df.type == "ls") | (df.type == "content")]
        elif opt in ("-m", "--mode") and arg in "rlsGC":
            orders = ["content", "ls", "rlsWithGC"]
            labels = ["content", "LogootSplit", "RLS with GC"]
            palette = {"content": blue, "ls": red, "rlsWithGC": green}
            df = df[(df.type == "ls") | (df.type == "content") | (df.type == "rlsWithGC")]
        elif opt in ("-n", "--dry-run"):
            dry_run = True

    # Settings pour 1 plot
    # df = df[(df.nbRenamingBots == 1)]

    df.nbOpes = df.nbOpes.div(1000)
    df.nbOpes = df.nbOpes.astype(int)
    df["size"] = df["size"].div(1000)

    generate_plot(df, orders, labels, palette, dry_run)

def generate_plot(df, orders, labels, palette, dry_run):
    # Settings 1 plot
    # res = sns.relplot(x="nbOpes", y="size", hue="type", style="type", data=df, kind="line", hue_order=orders, palette=palette, legend=False)

    # Settings 4 plots alignées
    res = sns.relplot(x="nbOpes", y="size", hue="type", style="type", data=df, kind="line", col="nbRenamingBots", hue_order=orders, palette=palette, legend=False)

    res.set(yscale="log")
    res.set_axis_labels("Nb of ops (thousands)", "Size (KB)")
    res.set_titles("{col_name} renaming bots")
    res.add_legend(labels=labels, ncol=2, loc="lower center", bbox_to_anchor=(0,-0.2))

    # Settings pour 1 plot
    # plt.legend(labels=labels, ncol=4, loc='upper left', bbox_to_anchor=(0.1, -0.15), edgecolor="1")

    # Settings pour 4 plots alignées
    res.axes[0][1].legend(labels=labels, ncol=4, loc='lower left', bbox_to_anchor=(-0.12, -0.42), edgecolor="1")

    # plt.tight_layout()

    # for ax in res.axes:
    #     for index in range(1, 6):
    #         ax.add_patch(patches.Rectangle(((index * 30) - 2, 0), 5, 50000, color='gray', alpha=0.3, zorder=0))

    if dry_run:
        plt.show()
    else:
        plt.savefig("../wip-results/2022-12-07-snapshot-sizes-rls-1-4-rb.pdf",format="pdf", transparent="True")

if __name__ == "__main__":
    main(sys.argv[1:])
