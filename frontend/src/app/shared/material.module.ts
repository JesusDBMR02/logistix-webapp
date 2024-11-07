import { NgModule } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { StepperModule } from 'primeng/stepper';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@NgModule({
  exports: [
    ToolbarModule,
    CardModule,
    PasswordModule,
    InputTextModule,
    ToastModule,
    ButtonModule,
    DividerModule,
    FloatLabelModule,
    StepperModule,
    InputMaskModule,
    ConfirmDialogModule,
    ProgressSpinnerModule
    ]
})
export class MaterialModule {}