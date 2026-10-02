from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database.mongodb import get_database
from app.models.company import CompanyCreate, CompanyResponse
from app.utils.dependencies import get_current_admin


router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


# =========================================================
# CREATE COMPANY
# =========================================================

@router.post(
    "/",
    response_model=CompanyResponse,
    status_code=201
)
def create_company(
    company: CompanyCreate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    existing_company = db.companies.find_one({
        "name": company.name
    })

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company already exists"
        )

    new_company = {
        "name": company.name,
        "description": company.description,
        "location": company.location,
        "website": company.website,
        "logo": company.logo,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.companies.insert_one(
        new_company
    )

    return CompanyResponse(
        id=str(result.inserted_id),
        name=new_company["name"],
        description=new_company["description"],
        location=new_company["location"],
        website=new_company["website"],
        logo=new_company["logo"],
        created_at=new_company["created_at"]
    )


# =========================================================
# GET ALL COMPANIES
# =========================================================

@router.get(
    "/",
    response_model=list[CompanyResponse]
)
def get_companies():
    db = get_database()

    companies = []

    for company in db.companies.find().sort(
        "created_at",
        -1
    ):

        companies.append(
            CompanyResponse(
                id=str(company["_id"]),
                name=company["name"],
                description=company.get(
                    "description",
                    ""
                ),
                location=company.get(
                    "location",
                    ""
                ),
                website=company.get(
                    "website"
                ),
                logo=company.get(
                    "logo"
                ),
                created_at=company["created_at"]
            )
        )

    return companies


# =========================================================
# GET SINGLE COMPANY
# =========================================================

@router.get(
    "/{company_id}",
    response_model=CompanyResponse
)
def get_company(
    company_id: str
):
    db = get_database()

    try:
        object_id = ObjectId(company_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid company ID"
        )

    company = db.companies.find_one({
        "_id": object_id
    })

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    return CompanyResponse(
        id=str(company["_id"]),
        name=company["name"],
        description=company.get(
            "description",
            ""
        ),
        location=company.get(
            "location",
            ""
        ),
        website=company.get(
            "website"
        ),
        logo=company.get(
            "logo"
        ),
        created_at=company["created_at"]
    )


# =========================================================
# UPDATE COMPANY
# =========================================================

@router.put(
    "/{company_id}",
    response_model=CompanyResponse
)
def update_company(
    company_id: str,
    company: CompanyCreate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    try:
        object_id = ObjectId(company_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid company ID"
        )

    existing_company = db.companies.find_one({
        "_id": object_id
    })

    if not existing_company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    duplicate_company = db.companies.find_one({
        "name": company.name,
        "_id": {
            "$ne": object_id
        }
    })

    if duplicate_company:
        raise HTTPException(
            status_code=400,
            detail="Company already exists"
        )

    db.companies.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "name": company.name,
                "description": company.description,
                "location": company.location,
                "website": company.website,
                "logo": company.logo,
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        }
    )

    updated_company = db.companies.find_one({
        "_id": object_id
    })

    return CompanyResponse(
        id=str(updated_company["_id"]),
        name=updated_company["name"],
        description=updated_company.get(
            "description",
            ""
        ),
        location=updated_company.get(
            "location",
            ""
        ),
        website=updated_company.get(
            "website"
        ),
        logo=updated_company.get(
            "logo"
        ),
        created_at=updated_company["created_at"]
    )


# =========================================================
# DELETE COMPANY
# =========================================================

@router.delete(
    "/{company_id}"
)
def delete_company(
    company_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    try:
        object_id = ObjectId(company_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid company ID"
        )

    existing_company = db.companies.find_one({
        "_id": object_id
    })

    if not existing_company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    db.companies.delete_one({
        "_id": object_id
    })

    return {
        "message": "Company deleted successfully",
        "company_id": company_id
    }