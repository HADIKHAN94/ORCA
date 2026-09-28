from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import db

SECRET_KEY = "orca_super_secret_key_for_hackathon"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/api/auth", tags=["auth"])


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Fisherman"


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=Token)
def register(user: UserCreate, session: Session = Depends(db.get_db)):
    db_user = session.query(db.User).filter(db.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_user = db.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role, "id": new_user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }


@router.post("/login", response_model=Token)
def login(user: UserLogin, session: Session = Depends(db.get_db)):
    db_user = session.query(db.User).filter(db.User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role, "id": db_user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }
