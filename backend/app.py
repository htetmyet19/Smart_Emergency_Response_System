from flask import Flask, jsonify, request
from flask_cors import CORS
import networkx as nx
import math

from graph_loader import load_graph
from astar import heuristic

app = Flask(__name__)
CORS(app)

G = load_graph()

# -----------------------------
# Distance function
# -----------------------------
def distance(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

# -----------------------------
# Find nearest hospital
# -----------------------------
def find_nearest_hospital(graph, lat, lng):
    min_dist = float("inf")
    nearest = None

    for node in graph.nodes:
        if "Hospital" in node:
            node_pos = graph.nodes[node]['pos']
            d = distance((lat, lng), node_pos)

            if d < min_dist:
                min_dist = d
                nearest = node

    return nearest

# -----------------------------
# Route API
# -----------------------------
@app.route("/route")
def get_route():
    lat = request.args.get("lat")
    lng = request.args.get("lng")

    temp_graph = G.copy()

    if lat and lng:
        lat = float(lat)
        lng = float(lng)

        accident_node = "TempAccident"
        temp_graph.add_node(accident_node, pos=(lat, lng))

        # 🔥 Connect to 3 nearest nodes
        nearest_nodes = sorted(
            G.nodes,
            key=lambda node: distance((lat, lng), G.nodes[node]['pos'])
        )[:3]

        for node in nearest_nodes:
            d = distance((lat, lng), G.nodes[node]['pos'])
            temp_graph.add_edge(accident_node, node, weight=d)

        nearest_hospital = find_nearest_hospital(G, lat, lng)

        start = nearest_hospital
        end = accident_node

    else:
        start = "Hospital1"
        end = "University"
        nearest_hospital = start

    # A* path
    path = nx.astar_path(
        temp_graph,
        start,
        end,
        heuristic=lambda a, b: heuristic(temp_graph, a, b),
        weight='weight'
    )

    coords = [temp_graph.nodes[node]['pos'] for node in path]

    # -----------------------------
    # Distance + Time calculation
    # -----------------------------
    total_distance = 0
    for i in range(len(coords) - 1):
        total_distance += distance(coords[i], coords[i+1])

    total_distance_km = total_distance * 111  # approx conversion

    speed = 40  # km/h
    time_minutes = (total_distance_km / speed) * 60

    return jsonify({
        "path": coords,
        "hospital": nearest_hospital,
        "distance": round(total_distance_km, 2),
        "time": round(time_minutes, 2)
    })

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)