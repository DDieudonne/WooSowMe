import { Injectable } from "@angular/core";
import { Subject } from "rxjs-compat";
import { FormControl } from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  // AUTORIZATION ONINIT
  authorizationSource = new Subject<boolean>();
  // AUTORIZATION ONINIT
  mapCommunication = new Subject<any>();
  profilEventSource = new Subject<any>();
  changePageEvent = new Subject<any>();
  postModeEvent = new Subject<any>();
  requestModeEvent = new Subject<any>();
  receiveNotificationToast = new Subject<any>();
  requestIdNotification = new Subject<any>();
  changeViewEvent = new Subject<any>();

}


