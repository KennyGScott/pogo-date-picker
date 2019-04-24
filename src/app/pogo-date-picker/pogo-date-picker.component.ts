import { Component, Output, EventEmitter, Input, OnChanges, HostListener, ElementRef } from '@angular/core';
import * as moment from 'moment';
import * as PogoModels from './pogo-date-picker.model';
@Component({
  selector: 'pogo-date-picker',
  templateUrl: './pogo-date-picker.component.html',
  styleUrls: ['./pogo-date-picker.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})

export class PogoDatePickerComponent implements OnChanges {
  /**
   * Property declarations
   */
  public dates: Array<PogoModels.CalendarDate>;
  public dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public monthList: Array<PogoModels.MonthListItem>;
  public activeDate;
  public selectedDate;
  public showMonthSelector: boolean;
  public showYearSelector: boolean;
  public initialDate;
  public visible: boolean;
  private closeEnabled = true;
  /**
   * Input & Output declarations
   */
  @Input() importantDates: Array<any>;
  @Input() date: string;
  @Output() dateChange = new EventEmitter<string>();

  /**
   * Events
   */
  @HostListener('click', ['$event'])
  clickInside(event: any) {
    this.closeEnabled = false;
  }
  /**
   * Component constructor
   */
  constructor(private elmRef: ElementRef) {
    this.dates = new Array<PogoModels.CalendarDate>();
    this.activeDate = moment();
    this.selectedDate = this.activeDate;
    this.initialDate = this.activeDate.format('YYYY-MM-DD');
    this.visible = false;
  }

  /**
   * Getters & setters
   */

  /**
   * Lifecycle hooks
   */
  ngOnChanges() {
    this.generateCalendar();
    this.generateMonthList();

    if (this.date) {
      this.buildActiveDate(null, null, null, this.date);
    }
  }

  onClick(event) {
    if (this.showMonthSelector || this.showYearSelector) { return false; }
    if (!this.elmRef.nativeElement.contains(event.target)  && this.closeEnabled) {
      this.closePicker();
    }
    this.closeEnabled = true;
  }
  /**
   * Component Methods
   */
  public setSelected(date) {
    let selected = false;
    if (this.date && this.date === date)
    {
      selected = true;
    } else if (!this.date && this.initialDate === date)
    {
      selected = true;
    } else
    {
      selected = false;
    }
    return selected;
  }

  public closePicker() {
    this.visible = false;
  }

  public setDate(date) {
    if (date.offset === null)
    {
      return;
    }
    this.selectedDate = date.fullDate;
    this.initialDate = '';
    this.dateChange.emit(date.fullDate);
    this.closePicker();
  }

  public closeMonthSelector(evt) {
    this.showMonthSelector = evt;
  }

  public closeYearSelector(evt) {
    this.showYearSelector = evt;
  }

  public updateMonth(evt) {
    const month = evt;
    this.buildActiveDate(null, month, null, null);
  }

  public updateYear(evt) {
    const year = evt;
    const month = this.activeDate.month();
    this.buildActiveDate(year, month + 1, null, null);
  }

  public getActiveDate(date = this.activeDate) {
    const activeMonth = moment(date).format('MMMM');
    const activeYear = moment(date).format('YYYY');
    return {
      month: activeMonth,
      year: activeYear
    };
  }

  public getPrevMonth() {
    const prevMonth = this.activeDate.subtract(1, 'months');
    this.setActiveDate(prevMonth);
  }

  public getNextMonth() {
    const nextMonth = this.activeDate.add(1, 'months');
    this.setActiveDate(nextMonth);
  }

  private buildActiveDate(year = null, month = null, date = null, fullDate = null) {
    if (fullDate)
    {
      this.setActiveDate(fullDate);
      return;
    }
    if (this.date)
    {
      this.setActiveDate(this.date);
    }
    const currentYear = moment(this.activeDate).year();
    const currentMonth = moment(this.activeDate).month();
    const currentDate = moment(this.activeDate).date();
    const newYear = year === null ? currentYear : year;
    let newMonth = month === null ? currentMonth : month;
    let newDate = date === null ? currentDate : date;

    newMonth = newMonth < 10 ? '0' + newMonth : newMonth;
    newDate = newDate < 10 ? '0' + newDate : newDate;

    const activeDate = `${newYear}-${newMonth}-${newDate}`;
    this.setActiveDate(activeDate);
  }

  private setActiveDate(date) {
    this.activeDate = moment(date, 'YYYY-MM-DD');
    this.generateCalendar();
  }

  private setOffset() {
    const offset = this.dates[0].offset;
    const blankDay = {
      dayName: '',
      dayOfMonth: '00',
      fullDate: '',
      offset: null,
      isImportant: false
    };
    if (offset !== null)
    {
      for (let i = 0; i < offset; i++)
      {
        this.dates.unshift(blankDay);
      }
    }
    const endOffset = 40 - this.dates.length;
    for (let i = 0; i < endOffset; i++)
    {
      this.dates.push(blankDay);
    }
  }

  private generateMonthList() {
    const monthList = new Array<PogoModels.MonthListItem>();
    const months = moment.monthsShort();
    months.forEach((month, idx) => {
      monthList.push({
        name: month,
        index: idx + 1
      });
    });
    this.monthList = monthList;
  }

  private generateCalendar(direction = null) {
    const currentDate = moment(this.activeDate);
    const month = moment(currentDate).month() + 1;
    const year = currentDate.year();
    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');
    const dates = new Array<PogoModels.CalendarDate>();
    for (let i = startOfMonth.date(); i <= endOfMonth.date(); i++)
    {
      const date = `${month}/${i}/${year}`.toString();
      const fullDate = moment(date, 'MM/D/YYYY').format('YYYY-MM-DD');
      const day = fullDate.split('-')[2];
      const important = this.importantDates !== null ? this.importantDates.includes(fullDate) : false;
      dates.push({
        dayName: this.dayNames[startOfMonth.day()],
        dayOfMonth: day,
        fullDate: fullDate,
        offset: moment(fullDate).day(),
        isImportant: important
      });
      startOfMonth.add(1, 'days');
    }
    this.dates = dates;
    this.setOffset();
  }
}
