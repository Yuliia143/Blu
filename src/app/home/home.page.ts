import { Component } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public devices = [];

  constructor(private ble: BLE) {}

  public scan(): void {
    this.ble.scan([], 30).subscribe(device => {
      window.alert(JSON.stringify(device));
      console.log(device);
      this.devices.push(device);
    });
  }

}
