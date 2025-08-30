import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Body() body: any, @Res() res: Response) {
    res.cookie("mock_token", "ok", { httpOnly: true, sameSite: "lax" });
    res.send({ ok: true });
  }
}
