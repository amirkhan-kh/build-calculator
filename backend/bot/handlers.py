from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
)

from auth.services.password_service import PasswordService
from core.db.session import async_session
from firms.filters import FirmFilter
from firms.repositories import FirmRepository
from users.repositories import UserRepository

router = Router()
authorized: dict[int, int] = {}


class LoginStates(StatesGroup):
    username = State()
    password = State()


class AddFirmStates(StatesGroup):
    form = State()
    field = State()


class EditFirmStates(StatesGroup):
    username = State()
    password = State()


class SearchStates(StatesGroup):
    name = State()


def main_kb():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Firmalar ro'yxati"), KeyboardButton(text="Firma qo'shish")],
            [KeyboardButton(text="Qidirish"), KeyboardButton(text="Chiqish")],
        ],
        resize_keyboard=True,
    )


def is_auth(telegram_id: int) -> bool:
    return telegram_id in authorized


def firm_actions_kb(firm_id: int, is_active: bool):
    status_label = "Active emas qilish" if is_active else "Active qilish"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Edit", callback_data=f"edit:{firm_id}"),
                InlineKeyboardButton(text=status_label, callback_data=f"toggle:{firm_id}"),
            ]
        ]
    )


def format_firm(firm) -> str:
    status = "active" if firm.is_active else "active emas"
    return (
        f"🏢 {firm.name}\n"
        f"Login: {firm.username}\n"
        f"Parol: {firm.password}\n"
        f"Status: {status}"
    )


def html_esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def add_form_text(name: str, username: str, password: str) -> str:
    return (
        "<b>Firma qo'shish</b>\n\n"
        f"<b>Firma nomi</b> *\n{html_esc(name) or '—'}\n"
        "<i>Bu nom faqat sizning jadvalingizda ko'rinadi</i>\n\n"
        f"<b>Login</b> *\n{html_esc(username) or '—'}\n\n"
        f"<b>Parol</b> *\n{html_esc(password) or '—'}"
    )


def add_form_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Firma nomi", callback_data="add_firm:name"),
                InlineKeyboardButton(text="Login", callback_data="add_firm:login"),
            ],
            [InlineKeyboardButton(text="Parol", callback_data="add_firm:password")],
            [
                InlineKeyboardButton(text="Bekor qilish", callback_data="add_firm:cancel"),
                InlineKeyboardButton(text="Qo'shish", callback_data="add_firm:save"),
            ],
        ]
    )


FIELD_PROMPTS = {
    "name": "Firma nomini kiriting:\nMasalan: Dendoor",
    "username": "Login kiriting:\nMasalan: firma_login",
    "password": "Parol kiriting:",
}

FIELD_KEYS = {
    "name": "name",
    "login": "username",
    "password": "password",
}


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    if is_auth(message.from_user.id):
        await message.answer("Boshqaruv menyusi", reply_markup=main_kb())
        return
    await state.set_state(LoginStates.username)
    await message.answer("Login kiriting:", reply_markup=ReplyKeyboardRemove())


@router.message(Command("login"))
async def cmd_login(message: Message, state: FSMContext):
    await state.set_state(LoginStates.username)
    await message.answer("Login kiriting:", reply_markup=ReplyKeyboardRemove())


@router.message(LoginStates.username)
async def login_username(message: Message, state: FSMContext):
    await state.update_data(username=(message.text or "").strip())
    await state.set_state(LoginStates.password)
    await message.answer("Parol kiriting:")


@router.message(LoginStates.password)
async def login_password(message: Message, state: FSMContext):
    data = await state.get_data()
    username = data.get("username", "")
    password = message.text or ""
    await state.clear()

    async with async_session() as db:
        user_repo = UserRepository(db)
        user = await user_repo.get_user_by_username(username)
        ok = user and user.is_platform_admin and await PasswordService.verify_password(
            password, user.hashed_password
        )
        if not ok:
            await message.answer("Login yoki parol noto'g'ri. /start")
            return
        authorized[message.from_user.id] = user.id

    await message.answer("Kirish muvaffaqiyatli.", reply_markup=main_kb())


@router.message(F.text == "Chiqish")
async def logout(message: Message, state: FSMContext):
    authorized.pop(message.from_user.id, None)
    await state.clear()
    await message.answer("Chiqildi. /start", reply_markup=ReplyKeyboardRemove())


@router.message(F.text == "Firmalar ro'yxati")
async def list_firms(message: Message):
    if not is_auth(message.from_user.id):
        await message.answer("Avval /start orqali kiring")
        return
    async with async_session() as db:
        repo = FirmRepository(db)
        firms = await repo.get_firm_list(None)
        count = await repo.get_firm_count()
    if not firms:
        await message.answer(f"Firmalar: 0\nHozircha firma yo'q")
        return
    await message.answer(f"Firmalar: {count}")
    for firm in firms:
        await message.answer(format_firm(firm), reply_markup=firm_actions_kb(firm.id, firm.is_active))


@router.message(F.text == "Firma qo'shish")
async def add_firm_start(message: Message, state: FSMContext):
    if not is_auth(message.from_user.id):
        await message.answer("Avval /start orqali kiring")
        return
    await state.set_state(AddFirmStates.form)
    await state.update_data(name="", username="", password="")
    await message.answer("Firma qo'shish", reply_markup=ReplyKeyboardRemove())
    sent = await message.answer(
        add_form_text("", "", ""),
        reply_markup=add_form_kb(),
        parse_mode="HTML",
    )
    await state.update_data(form_chat_id=sent.chat.id, form_message_id=sent.message_id)


@router.callback_query(F.data.startswith("add_firm:"))
async def add_firm_buttons(callback: CallbackQuery, state: FSMContext):
    if not is_auth(callback.from_user.id):
        await callback.answer("Avval kiring", show_alert=True)
        return

    action = callback.data.split(":", 1)[1]
    data = await state.get_data()

    if action == "cancel":
        await state.clear()
        await callback.message.edit_text("Bekor qilindi")
        await callback.message.answer("Boshqaruv menyusi", reply_markup=main_kb())
        await callback.answer()
        return

    if action == "save":
        name = (data.get("name") or "").strip()
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        if not name or not username or not password.strip():
            await callback.answer("Nom, login va parolni kiriting", show_alert=True)
            return
        try:
            async with async_session() as db:
                repo = FirmRepository(db)
                firm = await repo.create_firm(
                    name=name,
                    username=username,
                    password=password,
                )
        except Exception as exc:
            await callback.answer(str(getattr(exc, "detail", exc)), show_alert=True)
            return
        await state.clear()
        await callback.message.edit_text("Firma qo'shildi\n\n" + format_firm(firm))
        await callback.message.answer("Boshqaruv menyusi", reply_markup=main_kb())
        await callback.answer()
        return

    field = FIELD_KEYS.get(action)
    if not field:
        await callback.answer()
        return

    await state.set_state(AddFirmStates.field)
    await state.update_data(field=field)
    await callback.message.answer(FIELD_PROMPTS[field])
    await callback.answer()


@router.message(AddFirmStates.field)
async def add_firm_field_value(message: Message, state: FSMContext):
    value = (message.text or "").strip()
    if value in {
        "Firmalar ro'yxati",
        "Firma qo'shish",
        "Qidirish",
        "Chiqish",
    }:
        await state.clear()
        await message.answer("Firma qo'shish bekor qilindi", reply_markup=main_kb())
        return
    data = await state.get_data()
    field = data.get("field")
    if not field:
        await state.set_state(AddFirmStates.form)
        return
    if not value:
        await message.answer(FIELD_PROMPTS.get(field, "Qiymat kiriting"))
        return

    await state.update_data(**{field: value})
    data = await state.get_data()
    await state.set_state(AddFirmStates.form)

    form_text = add_form_text(
        data.get("name", ""),
        data.get("username", ""),
        data.get("password", ""),
    )
    chat_id = data.get("form_chat_id")
    message_id = data.get("form_message_id")
    if chat_id and message_id:
        try:
            await message.bot.edit_message_text(
                form_text,
                chat_id=chat_id,
                message_id=message_id,
                reply_markup=add_form_kb(),
                parse_mode="HTML",
            )
            return
        except Exception:
            pass

    sent = await message.answer(form_text, reply_markup=add_form_kb(), parse_mode="HTML")
    await state.update_data(form_chat_id=sent.chat.id, form_message_id=sent.message_id)


@router.message(F.text == "Qidirish")
async def search_start(message: Message, state: FSMContext):
    if not is_auth(message.from_user.id):
        await message.answer("Avval /start orqali kiring")
        return
    await state.set_state(SearchStates.name)
    await message.answer("Firma nomi yoki 'active' / 'inactive' yozing:")


@router.message(SearchStates.name)
async def search_run(message: Message, state: FSMContext):
    await state.clear()
    q = (message.text or "").strip()
    filters = FirmFilter()
    if q.lower() in ("active", "faol"):
        filters.is_active = True
    elif q.lower() in ("inactive", "active emas", "faol emas"):
        filters.is_active = False
    else:
        filters.name__ilike = q

    async with async_session() as db:
        repo = FirmRepository(db)
        firms = await repo.get_firm_list(filters)
        count = await repo.get_firm_count(filters)

    await message.answer(f"Topildi: {count}", reply_markup=main_kb())
    for firm in firms:
        await message.answer(format_firm(firm), reply_markup=firm_actions_kb(firm.id, firm.is_active))


@router.callback_query(F.data.startswith("toggle:"))
async def toggle_firm(callback: CallbackQuery):
    if not is_auth(callback.from_user.id):
        await callback.answer("Avval kiring", show_alert=True)
        return
    firm_id = int(callback.data.split(":")[1])
    async with async_session() as db:
        repo = FirmRepository(db)
        firm = await repo.get_firm(firm_id)
        firm = await repo.update_firm(firm_id, is_active=not firm.is_active)
    await callback.message.edit_text(
        format_firm(firm),
        reply_markup=firm_actions_kb(firm.id, firm.is_active),
    )
    await callback.answer("Status yangilandi")


@router.callback_query(F.data.startswith("edit:"))
async def edit_firm_start(callback: CallbackQuery, state: FSMContext):
    if not is_auth(callback.from_user.id):
        await callback.answer("Avval kiring", show_alert=True)
        return
    firm_id = int(callback.data.split(":")[1])
    await state.update_data(firm_id=firm_id)
    await state.set_state(EditFirmStates.username)
    await callback.message.answer("Yangi login (o'zgarmasa - yuboring):")
    await callback.answer()


@router.message(EditFirmStates.username)
async def edit_firm_username(message: Message, state: FSMContext):
    await state.update_data(username=(message.text or "").strip())
    await state.set_state(EditFirmStates.password)
    await message.answer("Yangi parol (o'zgarmasa - yuboring):")


@router.message(EditFirmStates.password)
async def edit_firm_password(message: Message, state: FSMContext):
    data = await state.get_data()
    await state.clear()
    payload = {}
    if data.get("username") and data["username"] != "-":
        payload["username"] = data["username"]
    password = (message.text or "").strip()
    if password and password != "-":
        payload["password"] = password
    if not payload:
        await message.answer("O'zgarish yo'q", reply_markup=main_kb())
        return
    async with async_session() as db:
        repo = FirmRepository(db)
        firm = await repo.update_firm(data["firm_id"], **payload)
    await message.answer("Yangilandi:\n" + format_firm(firm), reply_markup=main_kb())
