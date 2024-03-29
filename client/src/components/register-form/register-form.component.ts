import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GenericMessage } from 'src/models/user';
import { AuthService } from 'src/service/auth.service';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css'],
})
export class RegisterFormComponent implements OnInit {
  registerForm!: FormGroup;
  constructor(private authservice: AuthService, private route: Router) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  onSubmit() {
    this.authservice
      .register(
        String(this.registerForm.value.name),
        String(this.registerForm.value.surname),
        String(this.registerForm.value.email),
        String(this.registerForm.value.password)
      )
      .subscribe({
        next: ({ message }) => {
          window.alert(
            `${String(message)}, check your email for validate your account`
          );
          this.route.navigate(['login']);
        },
        error: (error) => {
          window.alert(String(error.error.message));
        },
      });
  }
}
