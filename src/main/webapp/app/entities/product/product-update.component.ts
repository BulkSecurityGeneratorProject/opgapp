import {Component, OnInit} from '@angular/core';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {JhiAlertService} from 'ng-jhipster';
import {IProduct, Product} from 'app/shared/model/product.model';
import {ProductService} from './product.service';
import {HouseFarm, IHouseFarm} from 'app/shared/model/house-farm.model';
import {HouseFarmService} from 'app/entities/house-farm';
import {IOrder} from 'app/shared/model/order.model';
import {OrderService} from 'app/entities/order';
import {AccountService} from 'app/core';
import {SERVER_API_URL} from "app/app.constants";
import {SessionStorageService} from "ngx-webstorage";

@Component({
  selector: 'jhi-product-update',
  templateUrl: './product-update.component.html'
})
export class ProductUpdateComponent implements OnInit {
  isSaving: boolean;
  apiUrl: string = SERVER_API_URL;

  housefarms: IHouseFarm[];
  houseFarm: IHouseFarm;
  orders: IOrder[];
  currentAccount: any;
  image: any;
  product: IProduct;

  editForm = this.fb.group({
    id: [],
    name: [],
    image: [],
    price: [],
    availableAmountInLiters: [],
    availableAmountInKilograms: [],
    isAvailable: [],
    productType: [],
    houseFarm: [],
    order: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected productService: ProductService,
    protected houseFarmService: HouseFarmService,
    protected accountService: AccountService,
    protected orderService: OrderService,
    protected activatedRoute: ActivatedRoute,
    private sessionStorage: SessionStorageService,
    private fb: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router
  ) {
  }

  ngOnInit() {
    this.isSaving = false;

    this.activatedRoute.data.subscribe(({product}) => {
      this.updateForm(product);
    });
    this.houseFarmService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IHouseFarm[]>) => mayBeOk.ok),
        map((response: HttpResponse<IHouseFarm[]>) => response.body)
      )
      .subscribe((res: IHouseFarm[]) => (this.housefarms = res), (res: HttpErrorResponse) => this.onError(res.message));
    this.orderService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IOrder[]>) => mayBeOk.ok),
        map((response: HttpResponse<IOrder[]>) => response.body)
      )
      .subscribe((res: IOrder[]) => (this.orders = res), (res: HttpErrorResponse) => this.onError(res.message));

    if (!!this.route.snapshot.params['houseFarmId']) {
      this.houseFarmService
        .find(this.route.snapshot.params['houseFarmId'])
        .pipe(
          filter((mayBeOk: HttpResponse<IHouseFarm>) => mayBeOk.ok),
          map((response: HttpResponse<IHouseFarm>) => response.body)
        )
        .subscribe((res: IHouseFarm) => (this.houseFarm = res), (res: HttpErrorResponse) => this.onError(res.message));
    }

    sessionStorage.getItem("cartProducts");
  }

  updateForm(product: IProduct) {
    this.editForm.patchValue({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      availableAmountInLiters: product.availableAmountInLiters,
      availableAmountInKilograms: product.availableAmountInKilograms,
      isAvailable: product.isAvailable,
      productType: product.productType,
      houseFarm: product.houseFarm,
      image: product.image,
      order: product.order
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const product = this.createFromForm();
    if (product.id !== undefined) {
      this.subscribeToSaveResponse(this.productService.update(product));
    } else {
      this.subscribeToSaveResponse(this.productService.create(product));
    }
  }

  private createFromForm(): IProduct {
    const entity = {
      ...new Product(),
      id: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      price: this.editForm.get(['price']).value,
      availableAmountInLiters: this.editForm.get(['availableAmountInLiters']).value,
      availableAmountInKilograms: this.editForm.get(['availableAmountInKilograms']).value,
      isAvailable: this.editForm.get(['isAvailable']).value,
      productType: this.editForm.get(['productType']).value,
      image: this.getImage(),
      houseFarm: this.houseFarm
    };
    return entity;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProduct>>) {
    result.subscribe((res: HttpResponse<IProduct>) => this.onSaveSuccess(res), (res: HttpErrorResponse) => this.onSaveError());
  }

  protected onSaveSuccess(res: HttpResponse<IProduct>) {
    this.isSaving = false;
    this.router.navigate(['/product/', res.body.id, 'view']);
  }

  protected onSaveError() {
    this.isSaving = false;
  }

  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackHouseFarmById(index: number, item: IHouseFarm) {
    return item.id;
  }

  trackOrderById(index: number, item: IOrder) {
    return item.id;
  }

  onUploadFinished(event) {
    this.image = event.serverResponse.response.body;
  }

  private getImage() {
    if (this.image !== undefined) {
      return this.image;
    }
    else {
      if (this.product) {
        return this.product.image;
      }
      else {
        return null;
      }
    }
  }
}
