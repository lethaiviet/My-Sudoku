export default class Utils {
    static getPosByDirection(startPos, direction, distance) {
        return {
            x: startPos.x + direction.vector[0] * distance,
            y: startPos.y + direction.vector[1] * distance
        };
    }
}