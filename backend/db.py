from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./orca.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    chat_logs = relationship("ChatHistory", back_populates="user")
    sos_logs = relationship("SOSLog", back_populates="user")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    response = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    
    user = relationship("User", back_populates="chat_logs")

class SOSLog(Base):
    __tablename__ = "sos_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    lat = Column(Float)
    lon = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="ACTIVE")
    resolved_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="sos_logs")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
