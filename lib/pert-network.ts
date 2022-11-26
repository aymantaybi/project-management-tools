export interface PrecedenceCondition {
  task: string;
  anteriors: string[];
  duration: number;
}

export interface TaskSubsequents {
  task: string;
  subsequents: string[];
}

export interface Task extends PrecedenceCondition, TaskSubsequents {}

export interface ConvergingTasks {
  tasks: string[];
  end: string;
}

export interface TasksLevel {
  tasks: string[];
  level: number;
}

export interface NetworkStep {
  id: string;
  startingDateASAP?: number;
  startingDateALAP?: number;
}
export interface NetworkTask {
  id: string;
  source: string;
  target: string;
  duration: number;
  fictional?: boolean;
}

export interface Network {
  steps: NetworkStep[];
  tasks: NetworkTask[];
}

export interface StartingDate {
  step: number;
  date: number;
}

export class Pert {
  precedenceConditions: PrecedenceCondition[];

  constructor(precedenceConditions: PrecedenceCondition[]) {
    this.precedenceConditions = precedenceConditions;
  }

  taskSubsequents(task: string) {
    const subsequents: string[] = [];
    for (const precedenceCondition of this.precedenceConditions) {
      if (precedenceCondition.anteriors[precedenceCondition.anteriors.length - 1] == task) {
        subsequents.push(precedenceCondition.task);
      }
    }
    return subsequents;
  }

  tasksLevels() {
    const levels: Array<{ tasks: string[]; level: number }> = [];
    levels.push({ tasks: this.beginningTasks(), level: 0 });
    for (let i = 0; i < levels.length; i++) {
      const currentLevelTasks = levels[i].tasks;
      for (const currentLevelTask of currentLevelTasks) {
        const currentLevelTaskSubsequents = this.taskSubsequents(currentLevelTask);
        currentLevelTaskSubsequents.length > 0 && levels.push({ tasks: currentLevelTaskSubsequents, level: 0 });
      }
    }
    return levels.map((level, index) => ({ tasks: level.tasks, level: index }));
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
    const convergingTasks: ConvergingTasks[] = [];
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
            convergingTasks.push({
              tasks: [currentTaskWithNoSubsequents, anterior],
              end: taskWithCurrentTaskAsAnterior.task,
            });
          }
        }
      }
    }
    return convergingTasks;
  }

  tasksSubsequents(): TaskSubsequents[] {
    const tasks = this.precedenceConditions.map((precedenceCondition) => precedenceCondition.task);
    const tasksSubsequents: { [task: string]: string[] } = {};
    for (const task of tasks) {
      tasksSubsequents[task] = [];
      for (const precedenceCondition of this.precedenceConditions) {
        const anteriorsLength = precedenceCondition.anteriors.length;
        if (precedenceCondition.anteriors[anteriorsLength - 1] == task) {
          tasksSubsequents[task].push(precedenceCondition.task);
        }
      }
    }
    return Object.entries(tasksSubsequents).map(([key, value]) => ({ task: key, subsequents: value }));
  }

  taskStep(task: string, levels: TasksLevel[]) {
    const taskLevel = levels.find((level) => level.tasks.includes(task));
    return taskLevel ? taskLevel.level + 1 : null;
  }

  taskConvergence(task: string, convergingTasks: ConvergingTasks[]) {
    return convergingTasks.find((item) => item.tasks.includes(task));
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
    return this.tasksSubsequents().map((taskSubsequents, index) => ({
      ...taskSubsequents,
      ...this.precedenceConditions[index],
    }));
  }

  network(): Network {
    const tasks = this.tasks();
    const beginningTasks = this.beginningTasks();
    const completingTasks = this.completingTasks();
    const convergingTasks = this.convergingTasks(tasks);
    const levels = this.tasksLevels();
    const networkSteps: NetworkStep[] = this.steps(levels);
    const networkTasks: NetworkTask[] = [];

    for (const currentTask of tasks) {
      const currentTaskStep = this.taskStep(currentTask.task, levels);
      const taskSubsequents = this.taskSubsequents(currentTask.task);
      if (taskSubsequents.length) {
        for (const taskSubsequent of taskSubsequents) {
          const taskSubsequentStep = this.taskStep(taskSubsequent, levels);
          const id = currentTask.task;
          const source = String(currentTaskStep);
          const target = String(taskSubsequentStep);
          const duration = currentTask.duration;
          if (
            networkTasks.some(
              (item) => item.id == id && item.source == source && item.target == target && item.duration == duration
            )
          )
            continue;
          networkTasks.push({
            id: currentTask.task,
            source: String(currentTaskStep),
            target: String(taskSubsequentStep),
            duration: currentTask.duration,
          });
        }
      } else {
        const currentTaskConvergence = this.taskConvergence(currentTask.task, convergingTasks);
        if (currentTaskConvergence) {
          const currentTaskConvergenceEndStep = this.taskStep(currentTaskConvergence.end, levels);
          networkTasks.push({
            id: currentTask.task,
            source: String(currentTaskStep),
            target: String(currentTaskConvergenceEndStep),
            duration: currentTask.duration,
          });
        } else if (completingTasks.includes(currentTask.task)) {
          const finalStep = currentTaskStep ? currentTaskStep + 1 : null;
          networkTasks.push({
            id: currentTask.task,
            source: String(currentTaskStep),
            target: String(finalStep),
            duration: currentTask.duration,
          });
        }
      }
    }

    const fictionalTasks = this.fictionalTasks(tasks, { steps: networkSteps, tasks: networkTasks });

    const network = { steps: networkSteps, tasks: [...networkTasks, ...fictionalTasks] };

    const startingDatesASAP = this.startingDatesASAP(network);

    for (const startingDateASAP of startingDatesASAP) {
      const currentStep = String(startingDateASAP.step);
      const stepIndex = networkSteps.findIndex((step) => step.id == currentStep);
      if (stepIndex > -1) {
        networkSteps[stepIndex] = { id: currentStep, startingDateASAP: startingDateASAP.date };
      }
    }

    return { steps: networkSteps, tasks: [...networkTasks, ...fictionalTasks] };
  }

  fictionalTasks(tasks: Task[], network: Network) {
    const networkTasks = network.tasks;
    const fictionalTasks: NetworkTask[] = [];
    const tasksWithMultipleAnteriors = tasks.filter((task) => task.anteriors.length >= 2);
    for (const taskWithMultipleAnteriors of tasksWithMultipleAnteriors) {
      const { anteriors } = taskWithMultipleAnteriors;
      for (const anterior of anteriors) {
        const anteriorTask = tasks.find((task) => task.task == anterior);
        const anteriorTaskInNetwork = networkTasks.find((task) => task.id == anterior);
        const taskWithMultipleAnteriorsInNetwork = networkTasks.find(
          (task) => task.id == taskWithMultipleAnteriors.task
        );
        if (
          anteriorTask &&
          anteriorTaskInNetwork &&
          taskWithMultipleAnteriorsInNetwork &&
          anteriorTask.subsequents.length > 0 &&
          !anteriorTask.subsequents.includes(taskWithMultipleAnteriors.task)
        ) {
          fictionalTasks.push({
            id: `${anterior}"`,
            source: anteriorTaskInNetwork.target,
            target: taskWithMultipleAnteriorsInNetwork.source,
            duration: 0,
            fictional: true,
          });
        }
      }
    }
    return fictionalTasks;
  }

  startingDatesASAP(network: Network) {
    const startingDates: StartingDate[] = [{ step: 1, date: 0 }];
    const networkTasks = network.tasks;
    const steps = Array.from(new Set(networkTasks.map((item) => Number(item.target)).sort()));
    for (const step of steps) {
      const previousStepsTasks = networkTasks.filter((task) => task.target == String(step));
      const cumulativeDurations = [];
      for (const task of previousStepsTasks) {
        const taskStep = task.source;
        const taskStartingDate = startingDates.find((startingDate) => startingDate.step == Number(taskStep));
        const taskStartingDateValue = taskStartingDate?.date ? taskStartingDate.date : 0;
        const cumulativeDuration = taskStartingDateValue + task.duration;
        cumulativeDurations.push(cumulativeDuration);
      }
      startingDates.push({ step, date: Math.max(...cumulativeDurations) });
    }
    return startingDates;
  }
}
