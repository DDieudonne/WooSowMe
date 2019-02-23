import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { PostsItem } from '../models/post-home';
import { Observable } from '@firebase/util';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class PostServiceService {

  private postListRef = this.db.list('/Posts')

  constructor(private db: AngularFireDatabase) { }

  getAllPosts(){
    return this.postListRef.valueChanges();
  }


}
