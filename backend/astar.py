import heapq
import math

# Heuristic
def heuristic(G, n1, n2):
    x1, y1 = G.nodes[n1]['pos']
    x2, y2 = G.nodes[n2]['pos']
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

# A* implementation
def astar_algo(G, start, goal):
    open_set = []
    heapq.heappush(open_set, (0, start))

    came_from = {}

    g_score = {node: float('inf') for node in G.nodes}
    g_score[start] = 0

    f_score = {node: float('inf') for node in G.nodes}
    f_score[start] = heuristic(G, start, goal)

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal:
            # reconstruct path
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        for neighbor in G.neighbors(current):
            weight = G[current][neighbor]['weight']
            tentative_g = g_score[current] + weight

            if tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(G, neighbor, goal)

                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return []