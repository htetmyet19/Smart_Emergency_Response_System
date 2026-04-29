import json
import networkx as nx

def load_graph():
    with open("data/graph.json") as f:
        data = json.load(f)

    G = nx.Graph()

    # Add nodes
    for node, pos in data["nodes"].items():
        G.add_node(node, pos=tuple(pos["pos"]))

    # Add edges
    for edge in data["edges"]:
        if len(edge) == 3:
            u, v, w = edge
        else:
            u, v = edge
            x1, y1 = G.nodes[u]['pos']
            x2, y2 = G.nodes[v]['pos']
            w = ((x1 - x2)**2 + (y1 - y2)**2) ** 0.5

        G.add_edge(u, v, weight=w)

    return G