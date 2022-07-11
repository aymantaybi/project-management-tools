
interface Tasks {
    anterior: string[][],
    current: string[],
    subsequent: string[][],
}

export default class TasksPathFinder {

    tasks: Tasks;
    rawPaths: any[];
    paths: string[];

    constructor(tasks: any) {
        this.tasks = tasks;
        this.rawPaths = [];
        this.paths = [];
    }

    public findPaths(fromTask: string, toTask: string): any {
        this.rawPaths = [];
        this.paths = [];
        this.findRawPaths(fromTask, toTask);
        this.paths = this.rawPaths.filter(path => path[0] == fromTask && path[path.length - 1] == toTask);
        this.paths.sort((a, b) => a.length - b.length);
        return {
            paths: this.paths,
            longestPath: this.paths[this.paths.length - 1] || [],
            shortestPath: this.paths[0] || [],
        }
    }

    public findRawPaths(fromTask: string, toTask: string): any {

        var toTaskIndex = this.tasks.current.findIndex(currentTask => currentTask == toTask);

        var anteriorTasks = this.tasks.anterior[toTaskIndex];

        if (this.rawPaths.length == 0) {
            this.rawPaths.push(...anteriorTasks.map(anteriorTask => [anteriorTask, toTask]));
        } else {
            for (var anteriorTask of anteriorTasks) {
                var rawPath = [anteriorTask, ...this.rawPaths.find(path => path[0] == toTask)];
                this.rawPaths.push(rawPath);
            }
        }
        if (anteriorTasks.length > 0) {
            anteriorTasks.forEach(anteriorTask => this.findRawPaths(fromTask, anteriorTask));
        }
    }
}
