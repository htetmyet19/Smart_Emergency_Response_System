import json
import networkx as nx

def load_graph():
    with open("data/graph.json") as f:
        data = json.load(f)

    G = nx.Graph()

    for node, pos in data["nodes"].items():
        G.add_node(node, pos=tuple(pos))

    for u, v, w in data["edges"]:
        G.add_edge(u, v, weight=w)

    return G