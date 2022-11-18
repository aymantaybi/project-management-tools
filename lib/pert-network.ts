export interface PrecedenceCondition {
  task: string;
  anteriors: string[];
  duration: number;
}

interface TaskSubsequents {
  task: string;
  subsequents: string[];
}

interface Task extends PrecedenceCondition, TaskSubsequents {}

interface ConvergentesTasks {
  tasks: string[];
  end: string;
}

interface TasksLevel {
  tasks: string[];
  level: number;
}

interface Network {
  steps: Array<{ id: string }>;
  tasks: Array<{ id: string; source: string; target: string; duration: number }>;
}

export class Pert {
  precedenceConditions: PrecedenceCondition[];

  constructor(precedenceConditions: PrecedenceCondition[]) {
    this.precedenceConditions = precedenceConditions;
  }

  beginningTasks() {
    return this.precedenceConditions
      .filter((condition) => condition.anteriors.length == 0)
      .map((condition) => condition.task);
  }

  completingTasks() {
    const tasks: string[] = [];
    const anteriors: string[] = [];
    for (const precedenceCondition of this.precedenceConditions) {
      tasks.push(precedenceCondition.task);
      anteriors.push(...precedenceCondition.anteriors);
    }
    return tasks.filter((task) => !anteriors.includes(task));
  }

  convergingTasks(tasks: Task[]) {
    const convergentTasks: ConvergentesTasks[] = [];
    for (const task of tasks) {
      if (task.subsequents.length == 0) {
        const currentTaskWithNoSubsequents = task.task;
        const taskWithCurrentTaskAsAnterior = tasks.find(
          (task) => task.anteriors.length >= 2 && task.anteriors.includes(currentTaskWithNoSubsequents)
        );
        if (taskWithCurrentTaskAsAnterior) {
          const { anteriors } = taskWithCurrentTaskAsAnterior;
          for (const anterior of anteriors) {
            if (anterior == currentTaskWithNoSubsequents) continue;
            convergentTasks.push({
              tasks: [currentTaskWithNoSubsequents, anterior],
              end: taskWithCurrentTaskAsAnterior.task,
            });
          }
        }
      }
    }
    return convergentTasks;
  }

  tasksSubsequents(precedenceConditions: PrecedenceCondition[]): TaskSubsequents[] {
    const tasks = precedenceConditions.map((precedenceCondition) => precedenceCondition.task);
    const tasksSubsequents: { [task: string]: string[] } = {};
    for (const task of tasks) {
      tasksSubsequents[task] = [];
      for (const precedenceCondition of precedenceConditions) {
        const anteriorsLength = precedenceCondition.anteriors.length;
        if (precedenceCondition.anteriors[anteriorsLength - 1] == task) {
          tasksSubsequents[task].push(precedenceCondition.task);
        }
      }
    }
    return Object.entries(tasksSubsequents).map(([key, value]) => ({ task: key, subsequents: value }));
  }

  tasksLevels(tasks: Task[]) {
    let lastLevelNumber = 0;
    const levels: Array<{ tasks: string[]; level: number }> = [];
    levels.push({ tasks: this.beginningTasks(), level: lastLevelNumber });
    for (const task of tasks) {
      if (task.subsequents.length) {
        lastLevelNumber = lastLevelNumber + 1;
        levels.push({ tasks: task.subsequents, level: lastLevelNumber });
      }
    }
    return levels;
  }

  taskStep(task: string, levels: TasksLevel[]) {
    const taskLevel = levels.find((level) => level.tasks.includes(task));
    return taskLevel ? taskLevel.level + 1 : null;
  }

  taskSubsequents(task: string, tasks: Task[]) {
    const currentTask = tasks.find((item) => item.task == task);
    return currentTask?.subsequents ?? [];
  }

  taskConvergence(task: string, convergentTasks: ConvergentesTasks[]) {
    return convergentTasks.find((item) => item.tasks.includes(task));
  }

  steps(levels: TasksLevel[]) {
    const steps = [];
    for (const level of levels.concat({ level: levels[levels.length - 1].level + 1, tasks: [] })) {
      steps.push({
        id: String(level.level + 1),
      });
    }
    return steps;
  }

  tasks(): Task[] {
    return this.tasksSubsequents(this.precedenceConditions).map((taskSubsequents, index) => ({
      ...taskSubsequents,
      ...this.precedenceConditions[index],
    }));
  }

  network(): Network {
    const network: Network = {
      steps: [],
      tasks: [],
    };

    const tasks = this.tasks();
    const beginningTasks = this.beginningTasks();
    const completingTasks = this.completingTasks();
    const convergentTasks = this.convergingTasks(tasks);
    const levels = this.tasksLevels(tasks);
    network.steps = this.steps(levels);

    for (const currentTask of tasks) {
      const currentTaskStep = this.taskStep(currentTask.task, levels);
      const taskSubsequents = this.taskSubsequents(currentTask.task, tasks);
      if (taskSubsequents.length) {
        for (const taskSubsequent of taskSubsequents) {
          const taskSubsequentStep = this.taskStep(taskSubsequent, levels);
          const id = currentTask.task;
          const source = String(currentTaskStep);
          const target = String(taskSubsequentStep);
          const duration = currentTask.duration;
          if (
            network.tasks.some(
              (item) => item.id == id && item.source == source && item.target == target && item.duration == duration
            )
          )
            continue;
          network.tasks.push({
            id: currentTask.task,
            source: String(currentTaskStep),
            target: String(taskSubsequentStep),
            duration: currentTask.duration,
          });
        }
      } else {
        const currentTaskConvergence = this.taskConvergence(currentTask.task, convergentTasks);
        if (currentTaskConvergence) {
          const currentTaskConvergenceEndStep = this.taskStep(currentTaskConvergence.end, levels);
          network.tasks.push({
            id: currentTask.task,
            source: String(currentTaskStep),
            target: String(currentTaskConvergenceEndStep),
            duration: currentTask.duration,
          });
        } else if (completingTasks.includes(currentTask.task)) {
          const finalStep = currentTaskStep ? currentTaskStep + 1 : null;
          network.tasks.push({
            id: currentTask.task,
            source: String(currentTaskStep),
            target: String(finalStep),
            duration: currentTask.duration,
          });
        }
      }
    }
    return network;
  }
}
