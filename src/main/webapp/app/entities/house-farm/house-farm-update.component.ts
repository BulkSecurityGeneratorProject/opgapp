import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';
import { IHouseFarm, HouseFarm } from 'app/shared/model/house-farm.model';
import { HouseFarmService } from './house-farm.service';
import { ILocation } from 'app/shared/model/location.model';
import { LocationService } from 'app/entities/location';

@Component({
  selector: 'jhi-house-farm-update',
  templateUrl: './house-farm-update.component.html'
})
export class HouseFarmUpdateComponent implements OnInit {
  isSaving: boolean;

  locations: ILocation[];
  dateFoundedDp: any;

  editForm = this.fb.group({
    id: [],
    name: [],
    hasLicense: [],
    dateFounded: [],
    contactNumber: [],
    location: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected houseFarmService: HouseFarmService,
    protected locationService: LocationService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ houseFarm }) => {
      this.updateForm(houseFarm);
    });
    this.locationService
      .query({ filter: 'housefarm-is-null' })
      .pipe(
        filter((mayBeOk: HttpResponse<ILocation[]>) => mayBeOk.ok),
        map((response: HttpResponse<ILocation[]>) => response.body)
      )
      .subscribe(
        (res: ILocation[]) => {
          if (!this.editForm.get('location').value || !this.editForm.get('location').value.id) {
            this.locations = res;
          } else {
            this.locationService
              .find(this.editForm.get('location').value.id)
              .pipe(
                filter((subResMayBeOk: HttpResponse<ILocation>) => subResMayBeOk.ok),
                map((subResponse: HttpResponse<ILocation>) => subResponse.body)
              )
              .subscribe(
                (subRes: ILocation) => (this.locations = [subRes].concat(res)),
                (subRes: HttpErrorResponse) => this.onError(subRes.message)
              );
          }
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  updateForm(houseFarm: IHouseFarm) {
    this.editForm.patchValue({
      id: houseFarm.id,
      name: houseFarm.name,
      hasLicense: houseFarm.hasLicense,
      dateFounded: houseFarm.dateFounded,
      contactNumber: houseFarm.contactNumber,
      location: houseFarm.location
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const houseFarm = this.createFromForm();
    if (houseFarm.id !== undefined) {
      this.subscribeToSaveResponse(this.houseFarmService.update(houseFarm));
    } else {
      this.subscribeToSaveResponse(this.houseFarmService.create(houseFarm));
    }
  }

  private createFromForm(): IHouseFarm {
    const entity = {
      ...new HouseFarm(),
      id: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      hasLicense: this.editForm.get(['hasLicense']).value,
      dateFounded: this.editForm.get(['dateFounded']).value,
      contactNumber: this.editForm.get(['contactNumber']).value,
      location: this.editForm.get(['location']).value
    };
    return entity;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IHouseFarm>>) {
    result.subscribe((res: HttpResponse<IHouseFarm>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackLocationById(index: number, item: ILocation) {
    return item.id;
  }
}