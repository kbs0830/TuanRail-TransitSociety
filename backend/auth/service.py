"""Authentication service placeholder.

This module is reserved for future login logic:
- password hashing
- JWT issuing/verification
- user credential checks
"""


def login_placeholder(email: str, password: str) -> dict:
    return {
        "ok": False,
        "message": "Login backend is not enabled yet.",
        "email": email,
    }
