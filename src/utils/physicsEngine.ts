import type { GameComponent, TriggerEvent, Target } from '@/types';
import {
  directionToOffset,
  getComponentInDirection,
  getComponentsInRange,
  getEffectiveDirection,
} from './componentFactory';
import { generateId } from './storage';

interface ScheduledTrigger {
  time: number;
  sourceId: string | null;
  targetId: string;
  eventType: TriggerEvent['eventType'];
  description: string;
}

export class PhysicsEngine {
  private components: GameComponent[] = [];
  private events: TriggerEvent[] = [];
  private scheduled: ScheduledTrigger[] = [];
  private currentTime: number = 0;
  private targets: Target[] = [];

  reset(components: GameComponent[], targets: Target[]) {
    this.components = components.map((c) => ({
      ...c,
      isTriggered: false,
      triggerTime: null,
      triggeredBy: null,
      animating: false,
    })) as GameComponent[];
    this.targets = targets.map((t) => ({ ...t, completed: false }));
    this.events = [];
    this.scheduled = [];
    this.currentTime = 0;
  }

  getState() {
    return {
      components: this.components,
      events: this.events,
      targets: this.targets,
      currentTime: this.currentTime,
    };
  }

  triggerComponent(componentId: string): boolean {
    const comp = this.components.find((c) => c.id === componentId);
    if (!comp || comp.isTriggered) return false;

    comp.isTriggered = true;
    comp.triggerTime = this.currentTime;
    comp.animating = true;

    this.addEvent(null, componentId, 'trigger', `${this.getComponentName(comp)} 被启动`);
    this.scheduleEffects(comp);
    return true;
  }

  private scheduleEffects(comp: GameComponent) {
    switch (comp.type) {
      case 'domino':
        this.scheduleDominoEffects(comp);
        break;
      case 'spring':
        this.scheduleSpringEffects(comp);
        break;
      case 'magnet':
        this.scheduleMagnetEffects(comp);
        break;
      case 'delayer':
        this.scheduleDelayerEffects(comp);
        break;
    }
  }

  private scheduleDominoEffects(comp: GameComponent & { type: 'domino' }) {
    const fallTime = comp.params.fallDuration;
    this.scheduled.push({
      time: this.currentTime + fallTime * 0.5,
      sourceId: comp.id,
      targetId: comp.id,
      eventType: 'fall',
      description: `${this.getComponentName(comp)} 开始倒下`,
    });

    const direction = getEffectiveDirection(comp);
    const target = getComponentInDirection(this.components, comp.x, comp.y, direction);
    if (target) {
      this.scheduled.push({
        time: this.currentTime + fallTime,
        sourceId: comp.id,
        targetId: target.id,
        eventType: 'trigger',
        description: `${this.getComponentName(comp)} 撞倒 ${this.getComponentName(target)}`,
      });
    }
  }

  private scheduleSpringEffects(comp: GameComponent & { type: 'spring' }) {
    this.scheduled.push({
      time: this.currentTime + 0.15,
      sourceId: comp.id,
      targetId: comp.id,
      eventType: 'spring_push',
      description: `${this.getComponentName(comp)} 弹簧弹出`,
    });

    const direction = getEffectiveDirection(comp);
    for (let i = 1; i <= comp.params.power; i++) {
      const target = getComponentInDirection(this.components, comp.x, comp.y, direction, i);
      if (target) {
        this.scheduled.push({
          time: this.currentTime + 0.2 + i * 0.05,
          sourceId: comp.id,
          targetId: target.id,
          eventType: 'trigger',
          description: `弹簧推动 ${this.getComponentName(target)}`,
        });
        break;
      }
    }
  }

  private scheduleMagnetEffects(comp: GameComponent & { type: 'magnet' }) {
    const nearby = getComponentsInRange(this.components, comp.x, comp.y, comp.params.range);
    const metalComponents = nearby.filter((c) => c.type === 'domino');

    this.scheduled.push({
      time: this.currentTime + 0.1,
      sourceId: comp.id,
      targetId: comp.id,
      eventType: 'magnet_pull',
      description: `${this.getComponentName(comp)} 产生磁力`,
    });

    metalComponents.forEach((target, idx) => {
      this.scheduled.push({
        time: this.currentTime + 0.3 + idx * 0.1,
        sourceId: comp.id,
        targetId: target.id,
        eventType: 'trigger',
        description: `磁力吸引 ${this.getComponentName(target)}`,
      });
    });
  }

  private scheduleDelayerEffects(comp: GameComponent & { type: 'delayer' }) {
    this.scheduled.push({
      time: this.currentTime + 0.05,
      sourceId: comp.id,
      targetId: comp.id,
      eventType: 'delay_start',
      description: `${this.getComponentName(comp)} 开始倒计时 (${comp.params.delayTime}s)`,
    });

    const direction = comp.params.outputDirection;
    const target = getComponentInDirection(this.components, comp.x, comp.y, direction);

    this.scheduled.push({
      time: this.currentTime + comp.params.delayTime,
      sourceId: comp.id,
      targetId: comp.id,
      eventType: 'delay_end',
      description: `${this.getComponentName(comp)} 倒计时结束`,
    });

    if (target) {
      this.scheduled.push({
        time: this.currentTime + comp.params.delayTime + 0.05,
        sourceId: comp.id,
        targetId: target.id,
        eventType: 'trigger',
        description: `延时器触发 ${this.getComponentName(target)}`,
      });
    }
  }

  step(deltaTime: number): { done: boolean; failureReason: string | null } {
    this.currentTime += deltaTime;

    const due = this.scheduled.filter((s) => s.time <= this.currentTime);
    this.scheduled = this.scheduled.filter((s) => s.time > this.currentTime);

    due.forEach((s) => {
      const targetComp = this.components.find((c) => c.id === s.targetId);
      if (targetComp) {
        targetComp.triggeredBy = s.sourceId;
      }
      this.addEvent(s.sourceId, s.targetId, s.eventType, s.description);

      if (s.eventType === 'trigger' && targetComp && !targetComp.isTriggered) {
        targetComp.isTriggered = true;
        targetComp.triggerTime = this.currentTime;
        targetComp.animating = true;
        this.scheduleEffects(targetComp);
      }
    });

    this.updateTargets();

    const done =
      this.scheduled.length === 0 &&
      this.components.every((c) => !c.animating || c.isTriggered);

    const allTargetsDone = this.targets.every((t) => t.completed);
    const anyTriggerFailed = this.checkForFailures();

    let failureReason: string | null = null;
    if (done && !allTargetsDone) {
      failureReason = this.getFailureReason();
    }

    return { done: done || allTargetsDone || anyTriggerFailed, failureReason };
  }

  private updateTargets() {
    this.targets.forEach((target) => {
      if (target.completed) return;

      switch (target.type) {
        case 'trigger_component':
          if (target.componentId) {
            const comp = this.components.find((c) => c.id === target.componentId);
            if (comp && comp.isTriggered) {
              target.completed = true;
            }
          }
          break;
        case 'all_triggered':
          const triggerable = this.components.filter((c) => c.type !== 'magnet');
          if (triggerable.length > 0 && triggerable.every((c) => c.isTriggered)) {
            target.completed = true;
          }
          break;
        case 'time_limit':
          if (target.maxTime && this.currentTime >= target.maxTime) {
            const allDone = this.components.filter((c) => c.type !== 'magnet').every((c) => c.isTriggered);
            target.completed = allDone;
          }
          break;
      }
    });
  }

  private checkForFailures(): boolean {
    return false;
  }

  private getFailureReason(): string {
    const untriggered = this.components.filter((c) => !c.isTriggered && c.type !== 'magnet');
    if (untriggered.length > 0) {
      const names = untriggered.slice(0, 3).map((c) => this.getComponentName(c)).join('、');
      const more = untriggered.length > 3 ? ` 等 ${untriggered.length} 个` : '';
      return `连锁中断：${names}${more} 未被触发`;
    }

    const uncompletedTargets = this.targets.filter((t) => !t.completed);
    if (uncompletedTargets.length > 0) {
      return `目标未达成：${uncompletedTargets[0].description}`;
    }

    return '实验未能完成所有目标';
  }

  private addEvent(
    sourceId: string | null,
    targetId: string | null,
    eventType: TriggerEvent['eventType'],
    description: string
  ) {
    this.events.push({
      id: generateId(),
      timestamp: this.currentTime,
      sourceId,
      targetId,
      eventType,
      description,
    });
  }

  private getComponentName(comp: GameComponent): string {
    const typeNames: Record<GameComponent['type'], string> = {
      domino: '骨牌',
      spring: '弹簧',
      magnet: '磁石',
      delayer: '延时器',
    };
    return `${typeNames[comp.type]}[${comp.x},${comp.y}]`;
  }
}

export const physicsEngine = new PhysicsEngine();
