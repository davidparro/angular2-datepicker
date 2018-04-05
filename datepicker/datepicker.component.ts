import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { FormControlName, FormControl, FormBuilder } from '@angular/forms';

export interface CalendarDate {
    mDate: moment.Moment;
    selected?: boolean;
    today?: boolean;
}

@Component({
    selector: 'app-datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit, OnChanges {
    currentDate = moment();
    dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    weeks: CalendarDate[][] = [];
    sortedDates: CalendarDate[] = [];
    selectedDates: CalendarDate[] = [];
    datepickerForm;
    @ViewChild('calendar') calendar: ElementRef;
    @Input('multiple') multiple? = false;
    @Input('label') label? = 'Select a date';
    @Input('align') align? = 'left';
    // formControl: FormControl = new FormControl();
    @Output() isSelectDate = new EventEmitter<CalendarDate>();

    constructor(
        public _fb: FormBuilder
    ) {
        this.datepickerForm = this._fb.group({
            date: ['']
        });
    }

    ngOnInit(): void {
        this.generateCalendar();
        document.body.onclick = function () {
            const listas = document.getElementsByClassName('calendar');
            for (let index = 0; index < listas.length; index++) {
                const element = listas[index];
                if (!element.classList.contains('hide')) {
                    element.classList.add('hide');
                }
            }
        };
        this.calendar.nativeElement.classList.add(this.align);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedDates &&
            changes.selectedDates.currentValue &&
            changes.selectedDates.currentValue.length  > 1) {
                // sort on date changes for better performance when range checking
                this.sortedDates = _.sortBy(changes.selectedDates.currentValue, (m: CalendarDate) => m.mDate.valueOf());
                this.generateCalendar();
        }
    }

    isToday(date: moment.Moment): boolean {
        return moment().isSame(moment(date), 'day');
    }

    isSelected(date: moment.Moment): boolean {
        return _.findIndex(this.selectedDates, (selectedDate) => {
          return moment(date).isSame(selectedDate.mDate, 'day');
        }) > -1;
    }

    isSelectedMonth(date: moment.Moment): boolean {
        return moment(date).isSame(this.currentDate, 'month');
    }

    selectDate(date: CalendarDate): void {
        if (this.multiple) {
        } else {
            if (!this.isSelected(date.mDate)) {
                date.selected = !date.selected;
                this.selectedDates.forEach(element => {
                    element.selected = false;
                });
                this.selectedDates.length = 0;
                this.selectedDates.push(date);
                console.log('NO está seleccionada');
                this.datepickerForm['controls'].date.setValue(date.mDate.format('YYYY-MM-DD'));
                this.isSelectDate.emit(date);
            } else {
                date.selected = !date.selected;
                console.log('Está seleccionada');
                const index = this.selectedDates.indexOf(date);
                this.selectedDates.splice(index, 1);
                this.datepickerForm['controls'].date.reset();
                this.isSelectDate.emit(null);
            }
        }
        console.log(this.selectedDates);
    }

      // actions from calendar
    prevMonth(): void {
        this.currentDate = moment(this.currentDate).subtract(1, 'months');
        console.log(this.currentDate);
        this.generateCalendar();
    }

    nextMonth(): void {
        this.currentDate = moment(this.currentDate).add(1, 'months');
        console.log(this.currentDate);
        this.generateCalendar();
    }

    firstMonth(): void {
        this.currentDate = moment(this.currentDate).startOf('year');
        this.generateCalendar();
    }

    lastMonth(): void {
        this.currentDate = moment(this.currentDate).endOf('year');
        this.generateCalendar();
    }

    prevYear(): void {
        this.currentDate = moment(this.currentDate).subtract(1, 'year');
        this.generateCalendar();
    }

    nextYear(): void {
        this.currentDate = moment(this.currentDate).add(1, 'year');
        this.generateCalendar();
    }

      // generate the calendar grid
    generateCalendar(): void {
        const dates = this.fillDates(this.currentDate);
        const weeks: CalendarDate[][] = [];
        while (dates.length > 0) {
            weeks.push(dates.splice(0, 7));
        }
        this.weeks = weeks;
    }

    fillDates(currentMoment: moment.Moment): CalendarDate[] {
        const firstOfMonth = currentMoment.clone().startOf('month').startOf('isoWeek');
        const firstDayOfGrid = currentMoment.clone().startOf('month').subtract(firstOfMonth.date(), 'days');
        const start = firstOfMonth.date();
        return _.range(start, start + 42)
                .map((date: number): CalendarDate => {
                    const d = firstDayOfGrid.clone().date(date);
                    return {
                        today: this.isToday(d),
                        selected: this.isSelected(d),
                        mDate: d,
                    };
                });
    }

    toggleCalendar() {
        setTimeout(() => {
            this.calendar.nativeElement.classList.toggle('hide');
        });
    }

    stopProp(event: Event) {
        if (!event) {
            window.event.stopImmediatePropagation();
            window.event.stopPropagation();
        } else {
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    }
}
