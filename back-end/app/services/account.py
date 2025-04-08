from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.models.user import User
from app.services.base import CRUDBase
from app.dto.user import UserCreate, UserUpdate


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_password_hash(self, password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password
        """
        return pwd_context.hash(password)
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash.
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password
            
        Returns:
            True if the password matches the hash, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    async def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """
        Get a user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            The user if found, None otherwise
        """
        query = select(self.model).where(self.model.email == email)
        result = await db.execute(query)
        return result.scalars().first()
    
    async def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            db: Database session
            obj_in: User data including password
            
        Returns:
            Created user
        """
        db_obj = User(
            email=obj_in.email,
            hashed_password=self.get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            phone_number=obj_in.phone_number,
            is_active=True,
            is_superuser=obj_in.is_superuser
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """
        Update a user.
        
        Args:
            db: Database session
            db_obj: Current user object
            obj_in: Updated user data
            
        Returns:
            Updated user
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        if "password" in update_data and update_data["password"]:
            hashed_password = self.get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
            
        return await super().update(db, db_obj=db_obj, obj_in=update_data)
    
    async def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user.
        
        Args:
            db: Database session
            email: User email
            password: User password
            
        Returns:
            Authenticated user if successful, None otherwise
        """
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    async def update_last_login(self, db: Session, *, user_id: int) -> Optional[User]:
        """
        Update a user's last login timestamp.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Updated user if found, None otherwise
        """
        user = await self.get(db, id=user_id)
        if not user:
            return None
            
        user.last_login = datetime.utcnow()
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    
    def create_access_token(
        self, subject: Union[str, Any], expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token.
        
        Args:
            subject: Token subject (usually user ID)
            expires_delta: Token expiry time
            
        Returns:
            JWT token string
        """
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
        return encoded_jwt
    
    def is_active(self, user: User) -> bool:
        """
        Check if a user is active.
        
        Args:
            user: User object
            
        Returns:
            True if the user is active, False otherwise
        """
        return user.is_active
    
    def is_superuser(self, user: User) -> bool:
        """
        Check if a user is a superuser.
        
        Args:
            user: User object
            
        Returns:
            True if the user is a superuser, False otherwise
        """
        return user.is_superuser


# Create an instance for importing
user = CRUDUser(User)