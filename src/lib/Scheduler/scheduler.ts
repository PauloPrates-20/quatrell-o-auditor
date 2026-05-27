import { Job } from '../definitions';
import fs from 'node:fs';
import path from 'node:path';

export class JobScheduler {
    jobs: Job[];
    interval: NodeJS.Timeout | null;

    constructor() {
        this.jobs = [];
        this.interval = null;
    }

    alloc({ name, weekDay, h, m, callback, lastCall }: Job) {
        this.jobs.push({ name, weekDay, h, m, callback, lastCall });

        if(!this.interval) {
            this._start();
        }
    }

    _start() {
        this.interval = setInterval(() => this._check(), 60*1000);

        // adjustments to start verify at the start of every minute
        const now = new Date();
        const msUntilNextMin = (60 - now.getSeconds())*1000 - now.getMilliseconds();

        setTimeout(() => {
            this._check();
            this.interval = setInterval(() => this._check(), 60*1000);
        }, msUntilNextMin);
    }

    _check() {
        const now = new Date();

        for(const job of this.jobs) {
            const isTime =
                now.getDay() === job.weekDay &&
                now.getHours() === job.h &&
                now.getMinutes() === job.m;

                const called =
                    job.lastCall &&
                    Number(now) - job.lastCall < 60*1000;
            
            if(isTime && !called) {
                job.lastCall = Number(now);

                try {
                    job.callback();
                } catch(e: any) {
                    console.error("[ERROR] Error running scheduled job callback!\n", e.message);
                }
            }
        }
    }
};