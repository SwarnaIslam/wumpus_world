// import { isCellVisited } from "./gameLogics.js";

// class Node {
//     constructor(x, y, g = 0, h = 0) {
//         this.x = x;
//         this.y = y;
//         this.g = g; // Cost from start to current node
//         this.h = h; // Heuristic (estimated cost to target)
//     }

//     get f() {
//         return this.g + this.h;
//     }
// }

// function calculateHeuristic(x1, y1, x2, y2) {
//     return Math.abs(x1 - x2) + Math.abs(y1 - y2);
// }

// // A* pathfinding function
// function findPath(startX, startY, targetX, targetY) {
//     const openList = []; // Priority queue of open nodes
//     const closedList = new Set(); // Set of closed nodes

//     const startNode = new Node(startX, startY);
//     const targetNode = new Node(targetX, targetY);

//     openList.push(startNode);

//     while (openList.length > 0) {
//         // Find the node with the lowest f score in the open list
//         const currentNode = openList.reduce((minNode, node) =>
//             node.f < minNode.f ? node : minNode, openList[0]);

//         // Remove the current node from the open list
//         openList.splice(openList.indexOf(currentNode), 1);

//         // Add the current node to the closed list
//         closedList.add(`${currentNode.x}-${currentNode.y}`);

//         // Check if we've reached the target
//         if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
//             const path = [];
//             let current = currentNode;

//             while (current) {
//                 path.unshift({ x: current.x, y: current.y });
//                 current = current.parent;
//             }

//             return path;
//         }

//         // Generate neighbor nodes
//         const neighbors = [
//             { x: currentNode.x - 1, y: currentNode.y },
//             { x: currentNode.x + 1, y: currentNode.y },
//             { x: currentNode.x, y: currentNode.y - 1 },
//             { x: currentNode.x, y: currentNode.y + 1 },
//         ];

//         for (const neighbor of neighbors) {
//             const [nx, ny] = [neighbor.x, neighbor.y];

//             // Skip if neighbor is out of bounds or in closed list
//             if (
//                 nx < 0 || nx >= 10 ||
//                 ny < 0 || ny >= 10 ||
//                 closedList.has(`${nx}-${ny}`)
//             ) {
//                 continue;
//             }

//             if (!isCellVisited(nx, ny) && !(nx === targetX && ny === targetY)) {
//                 continue;
//             }

//             // Calculate tentative g score
//             const gScore = currentNode.g + 1; // Assuming uniform cost

//             // Check if neighbor is not in the open list or has a lower g score
//             let neighborNode = openList.find(node => node.x === nx && node.y === ny);

//             if (!neighborNode || gScore < neighborNode.g) {
//                 if (!neighborNode) {
//                     neighborNode = new Node(nx, ny);
//                     openList.push(neighborNode);
//                 }

//                 neighborNode.parent = currentNode;
//                 neighborNode.g = gScore;
//                 neighborNode.h = calculateHeuristic(nx, ny, targetX, targetY);
//             }
//         }
//     }
// }

// export { findPath }