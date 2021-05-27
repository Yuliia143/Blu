import { Component, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  devices: any[] = [];
  peripheral: any = {};
  statusMessage: string;
  data: any;
  data1: any;
  data2: any;
  data3: any;
  data4: any;

  data5: any;
  data5JSON: any;
  data5float: any;
  data5St: any;
  data5ISt: any;
  data5L: any;
  data5A: any;
  data5StFromChar: any;
  data5A0: any;
  data5A4: any;
  data5A002: any;
  data5A001: any;

  constructor(public navCtrl: NavController,
              private toastCtrl: ToastController,
              private ble: BLE,
              private ngZone: NgZone) {
  }

  scan() {
    this.setStatus('Scanning');
    this.devices = [];

    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
    );

    setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
  }

  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.devices.push(device);
    });
  }

  async scanError(error) {
    this.setStatus('Error ' + error);
    const toast = await this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  deviceSelected(device) {
    this.setStatus('Connecting to ' + device.name || device.id);
    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.onDeviceDisconnected(peripheral)
    );
  }

  onConnected(peripheral) {
    this.ngZone.run(() => {
      this.setStatus('Connected');
      this.peripheral = peripheral;
      this.ble.read(this.peripheral.id, '1800', '2a00').then(
        data => {
          this.data1 = data;
        },
        error => this.setStatus('Error ' + error)
      );
      this.ble.read(this.peripheral.id, '1800', '2a01').then(
        data => this.data2 = data,
        error => this.setStatus('Error ' + error)
      );
      this.ble.read(this.peripheral.id, '180a', '2a25').then(
        data => this.data3 = data,
        error => this.setStatus('Error ' + error)
      );

      this.ble.read(this.peripheral.id, 'fee0', '00000006-0000-3512-2118-0009af100700').then( //battery
        data => {
          this.data5 = data;

          this.data5JSON = JSON.stringify(data);
          this.data5float = new Float32Array(data);
          this.data5St = String.fromCharCode.apply(null,new Uint8Array(data));
          this.data5ISt = new Int8Array(data).toString();
          this.data5L = data.byteLength;
          this.data5A = new Uint8Array(data);
          this.data5StFromChar = this.data5A.map(elem => String.fromCharCode(elem));
          this.data5A002 = new Uint8Array(data)[0].toString(2);
          this.data5A001 = new Uint8Array(data)[0].toString(10);
          this.data5A0 = new DataView(data).getInt32(0);
        },
        error => this.setStatus('Error ' + error)
      );

    });
  }

  async onDeviceDisconnected(peripheral) {
    const toast = await this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }


}
