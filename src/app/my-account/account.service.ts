import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Person, PersonUpdateRequest } from '../person/person.model';
import { Ong, OngUpdateRequest } from '../ong/ong.model';
import { environment } from '../../environments/environment';

export type UserType = 'PERSON' | 'ONG';

export interface UserInfo {
  userType: UserType;
  user: Person | Ong;
}

export interface AccountMeDto {
  person: Person | null;
  ong: Ong | null;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<AccountMeDto>(`${this.apiUrl}/account/me`).pipe(
      map((dto: AccountMeDto) => {
        if (dto.person) {
          return { userType: 'PERSON' as UserType, user: dto.person };
        } else if (dto.ong) {
          return { userType: 'ONG' as UserType, user: dto.ong };
        } else {
          throw new Error('Dados de usuário inválidos: Ambos os campos Pessoa e ONG são NULL');
        }
      })
    );
  }

  updatePerson(personId: string, updateData: PersonUpdateRequest): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/person/${personId}`, updateData);
  }

  updateOng(ongId: string, updateData: OngUpdateRequest): Observable<Ong> {
    return this.http.put<Ong>(`${this.apiUrl}/ong/${ongId}`, updateData);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/account/password`, {
      oldPassword,
      newPassword
    });
  }
}