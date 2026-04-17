import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email/resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, phone, cpf, cnpj, inscricao_estadual } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Dados obrigatórios não preenchidos." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // Bloquear CPF duplicado — evita múltiplas contas com mesmo CPF
    const cleanCpf = cpf?.replace(/\D/g, "") || null;
    if (cleanCpf && cleanCpf.length === 11) {
      const { data: existingCpf } = await supabase
        .from("customers")
        .select("id")
        .eq("cpf", cleanCpf)
        .single();
      if (existingCpf) {
        return NextResponse.json({ error: "Este CPF já está cadastrado. Faça login ou recupere sua senha." }, { status: 409 });
      }
    }

    // Create auth user with admin API (auto-confirms email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      // Handle duplicate email
      if (authError.message?.includes("already") || authError.message?.includes("exists")) {
        return NextResponse.json({ error: "Este e-mail já está cadastrado. Faça login ou recupere sua senha." }, { status: 409 });
      }
      console.error("Auth error:", authError);
      return NextResponse.json({ error: authError.message || "Erro ao criar conta." }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
    }

    // Insert customer profile
    const { error: profileError } = await supabase.from("customers").insert({
      id: authData.user.id,
      full_name,
      email,
      phone: phone?.replace(/\D/g, "") || null,
      cpf: cpf?.replace(/\D/g, "") || null,
      cnpj: cnpj?.replace(/\D/g, "") || null,
      inscricao_estadual: inscricao_estadual || null,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      // User was created in auth but profile failed - try to clean up
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Erro ao salvar dados do perfil. Tente novamente." }, { status: 500 });
    }

    // Send welcome email (fire and forget)
    sendWelcomeEmail({ customerName: full_name, customerEmail: email }).catch((err) =>
      console.error("Welcome email error:", err)
    );

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
