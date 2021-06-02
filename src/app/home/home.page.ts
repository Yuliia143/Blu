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
  size: any;

  binaryString: any;
  buff: any;
  view1: any;
  view10: any;
  view2: any;
  view20: any;

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

  parseData(data) {
    data = new Uint8Array(data);
    let ret = '';
    for (let i = 0; i < 20; i++) {
      ret = ret + data[i] + ',';
    }
    return ret;
  };

  convert(buffer) {
    const convertData = String.fromCharCode.apply(null, new Uint8Array(buffer));
    this.size = convertData.length;
    const hexResult = [];
    for (let i = 0; i < convertData.length; i++) {
      const resultNumber = convertData.charCodeAt(i);   //Dec
      const str = (+resultNumber).toString(16);
      let resultString = '';
      if (str.length <= 1) {
        resultString = ('0' + (+resultNumber).toString(16)).toUpperCase().substring(-2); //String
      } else {
        resultString = ('' + (+resultNumber).toString(16)).toUpperCase().substring(-2); //String
      }
      hexResult[i] = '0x' + resultString;
    }
    return hexResult;
  }

  onTemperatureChange(buffer: ArrayBuffer) {
    this.setStatus('change');

    this.view1 = buffer;
    this.view2 = new Uint8Array(buffer);
    //
    // this.ngZone.run(() => {
    //   this.data = data;
    // });

  }

  onStartNotification() {
    this.setStatus('startNot');

    this.ble.startNotification(this.peripheral.id, '71712a7e-bc95-4e65-a522-ea125ba4ac47', '86F4E91D-07AC-47CC-916B-69C8789635D3')
      .subscribe(
        buffer => {
          this.setStatus('subscribe');
          this.data = buffer;
          this.view1 = new Uint8Array(buffer);
        },
        () => this.setStatus('Unexpected Error'),
        () => this.setStatus('finally')

        // d => this.onTemperatureChange(d),
        // () => this.setStatus('Unexpected Error')
      );
  }

  onConnected(peripheral) {
    this.ngZone.run(() => {
      this.setStatus('Connected');
      this.peripheral = peripheral;

      this.ble.startStateNotifications().subscribe(d => {
        this.setStatus('startStateNotif');
        this.view2 = d;
      });

      // this.ble.read(this.peripheral.id, '71712a7e-bc95-4e65-a522-ea125ba4ac47', '131F59B3-75DA-45BC-BAAC-BC0A698B6371')
      //   .then(
      //     data => this.onTemperatureChange(data),
      //     () => this.setStatus('Failed to get')
      //   );


      // this.ble.read(this.peripheral.id, '71712a7e-bc95-4e65-a522-ea125ba4ac47', '86F4E91D-07AC-47CC-916B-69C8789635D3').then( //main charact
      //   data => {
      //     this.data5 = data;
      //     const bytes = new Uint8Array(data);
      //     const length = bytes.length;
      //     for (let i = 0; i < length; i++) {
      //       this.binaryString += String.fromCharCode(bytes[i]);
      //     }
      //
      //     this.pd = this.parseData(data);
      //     this.data5JSON = JSON.stringify(data);
      //     this.data5float = new Float32Array(data);
      //     this.data5Stb = String.fromCharCode.apply(null, data);
      //     this.data5St8 = String.fromCharCode.apply(null, new Uint8Array(data));
      //     this.data5St8A = String.fromCharCode.apply(String, new Uint8Array(data, 1, 8));
      //     this.data5St80 = this.data5St8.charCodeAt(0);
      //     this.data5St80L = String.fromCharCode(this.data5St80);
      //     this.data5St16 = String.fromCharCode.apply(null, new Uint16Array(data));
      //     this.data5ISt = new Int8Array(data).toString();
      //     this.data5ISt16 = new Int16Array(data).toString();
      //
      //     this.data5L = data.byteLength;
      //     this.data5A = new Uint8Array(data);
      //     this.data5AtoHEX = [...new Uint8Array(data)].map(el => el.toString(16).padStart(2, '0'));
      //     this.data5A002 = new Uint8Array(data)[0].toString(2);
      //     this.data5A001 = new Uint8Array(data)[0].toString(10);
      //
      //     this.hexResult = this.convert(data);
      //   },
      //   error => this.setStatus('Error ' + error)
      // );
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
