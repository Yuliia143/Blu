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
        this.ble.read(this.peripheral.id,'1800', '2a00').then(
          data => this.data1 = data,
          error => this.setStatus('Error ' + error)
        );
      this.ble.read(this.peripheral.id,'1800', '2a01').then(
        data => this.data2 = data,
        error => this.setStatus('Error ' + error)
      );
      this.ble.read(this.peripheral.id,'180a', '2a25').then(
        data => this.data3 = data,
        error => this.setStatus('Error ' + error)
      );
      this.ble.read(this.peripheral.id,'fee1', 'fed0').then(
        data => this.data4 = data,
        error => this.setStatus('Error ' + error)
      );

      // this.peripheral.characteristics.forEach(characteristic => {
      //   this.ble.read(this.peripheral.id, characteristic.service, characteristic.characteristic).then(
      //     data => this.data.push(data),
      //     error => this.setStatus('Error ' + error)
      //   );
      // });
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
