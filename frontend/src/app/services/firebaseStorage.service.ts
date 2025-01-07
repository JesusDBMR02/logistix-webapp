import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  constructor(private storage: AngularFireStorage) {}

  uploadFile(file: File, folder: string): Observable<string> {
    const filePath = `${folder}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // Observar los cambios en la tarea de carga
    return new Observable<string>(observer => {
      task.snapshotChanges().pipe(
        finalize(async () => {
          // Obtener la URL de descarga una vez que la carga se complete
          const downloadURL = await fileRef.getDownloadURL().toPromise();
          // Emitir la URL de descarga al observador
          observer.next(downloadURL);
          // Completar el observable
          observer.complete();
        })
      ).subscribe();
    });
  }
}