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

  process() {
    const beginningTasks = this.beginningTasks();
    const completingTasks = this.completingTasks();
    const tasks = this.tasks();
    const convergingTasks = this.convergingTasks(tasks);
    const tasksLevels = this.tasksLevels();
    const network = this.network();
    return { beginningTasks, completingTasks, convergingTasks, tasksLevels, network, tasks };
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
      .filter((condition) => condition.anteriors?.length == 0)
      .map((condition) => condition.task);
  }

  completingTasks() {
    const tasks: string[] = [];
    const anteriors: string[] = [];
    console.log({ precedenceCondition: this.precedenceConditions });
    for (const precedenceCondition of this.precedenceConditions) {
      tasks.push(precedenceCondition.task);
      anteriors.push(...precedenceCondition.anteriors);
    }
    return tasks.filter((task) => !anteriors.includes(task));
  }

  convergingTasks(tasks: Task[]) {
    const convergingTasks: ConvergingTasks[] = [];

    const groupeConvergingTasksByEnd = (convergingTasks: ConvergingTasks[]) => {
      const groupedConvergingTasks: ConvergingTasks[] = [];
      const allTasksEnds = Array.from(new Set(convergingTasks.map((item) => item.end)));
      for (const tasksEnd of allTasksEnds) {
        const tasksWithSameEnd = Array.from(
          new Set(
            convergingTasks
              .filter((item) => item.end == tasksEnd)
              .map((item) => item.tasks)
              .flat()
          )
        );
        groupedConvergingTasks.push({ tasks: tasksWithSameEnd, end: tasksEnd });
      }
      return groupedConvergingTasks;
    };

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
    const groupedConvergingTasks = groupeConvergingTasksByEnd(convergingTasks);
    return groupedConvergingTasks;
  }

  tasksSubsequents(): TaskSubsequents[] {
    const tasks = this.precedenceConditions.map((precedenceCondition) => precedenceCondition.task);
    const tasksSubsequents: TaskSubsequents[] = [];
    for (const task of tasks) {
      tasksSubsequents.push({ task, subsequents: this.taskSubsequents(task) });
    }
    return tasksSubsequents;
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

  taskDuration(task: string) {
    const taskPrecedenceCondition = this.precedenceConditions.find((condition) => condition.task == task);
    return taskPrecedenceCondition?.duration || 0;
  }

  taskAnteriors(task: string) {
    const anteriors: string[] = [];
    for (const precedenceCondition of this.precedenceConditions) {
      if (precedenceCondition.task == task) {
        anteriors.push(...precedenceCondition.anteriors);
      }
    }
    return anteriors;
  }

  network(): Network {
    const networkTasks: NetworkTask[] = [];
    const tasksLevels = this.tasksLevels();
    const tasks = this.tasks();
    const beginningTasks = this.beginningTasks();
    const completingTasks = this.completingTasks();
    const convergingTasks = this.convergingTasks(tasks);

    console.log({ convergingTasks });

    const latestTasksTarget = (): number => Math.max(...networkTasks.map((item) => Number(item.target)), 0);

    const taskTargetStep = (task: string) => {
      const networkTask = networkTasks.find((item) => item.id == task);
      return networkTask?.target || undefined;
    };

    const networkTaskSource = (task: string) => {
      const taskAnteriors = this.taskAnteriors(task);
      const taskSource = taskAnteriors.reverse().map((anterior) => taskTargetStep(anterior)).find((item) => item != undefined);
      if (!taskSource) throw new Error(`Unable to find task source of task : ${task}, Please fix you inputs !`);
      return taskSource;
    };

    const getNetworkTaskSource = (task: string) => {
      if (beginningTasks.includes(task)) {
        return String(1);
      } else {
        return String(networkTaskSource(task));
      }
    };

    const getNetworkTaskTarget = (task: string) => {
      const taskConvergence = convergingTasks.find((item) => item.tasks.includes(task));
      if (beginningTasks.includes(task)) {
        return String(latestTasksTarget() == 0 ? 2 : latestTasksTarget() + 1);
      } else if (taskConvergence) {
        const taskConvergingTasks = taskConvergence.tasks.filter((item) => item != task);
        const taskTarget = taskConvergingTasks
          .map((item) => taskTargetStep(item))
          .find((item) => item != undefined);
        if (!taskTarget) return String(latestTasksTarget() + 1);
        return taskTarget;
      } else {
        return String(latestTasksTarget() + 1);
      }
    };

    const tasksWithoutSubsequents = tasks
      .filter((item) => !completingTasks.includes(item.task) && item.subsequents.length == 0)
      .map((item) => item.task);

    for (const tasksLevel of tasksLevels) {
      for (const levelTask of tasksLevel.tasks) {
        if (completingTasks.includes(levelTask) || tasksWithoutSubsequents.includes(levelTask)) continue;
        const id = levelTask;
        const source = getNetworkTaskSource(levelTask);
        const target = getNetworkTaskTarget(levelTask);
        const duration = this.taskDuration(levelTask);
        networkTasks.push({
          id,
          source,
          target,
          duration,
        });
      }
    }

    for (const taskWithoutSubsequents of tasksWithoutSubsequents) {
      const id = taskWithoutSubsequents;
      const source = getNetworkTaskSource(taskWithoutSubsequents);
      const target = getNetworkTaskTarget(taskWithoutSubsequents);
      const duration = this.taskDuration(taskWithoutSubsequents);
      networkTasks.push({
        id,
        source,
        target,
        duration,
      });
    }

    const networkLastTasksTarget = String(latestTasksTarget() + 1);

    for (const completingTask of completingTasks) {
      const id = completingTask;
      const source = getNetworkTaskSource(completingTask);
      const target = networkLastTasksTarget;
      const duration = this.taskDuration(completingTask);
      networkTasks.push({
        id,
        source,
        target,
        duration,
      });
    }

    const networkSteps: NetworkStep[] = Array(latestTasksTarget())
      .fill(0)
      .map((item, index) => ({ id: String(index + 1) }));

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
