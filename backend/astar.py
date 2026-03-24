import math

def heuristic(G, n1, n2):
    x1, y1 = G.nodes[n1]['pos']
    x2, y2 = G.nodes[n2]['pos']
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)