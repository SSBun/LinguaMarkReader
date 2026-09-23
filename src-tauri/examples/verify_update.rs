use base64::{engine::general_purpose::STANDARD, Engine};
use minisign_verify::{PublicKey, Signature};
use std::{env, error::Error, fs};

fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().skip(1).collect();
    if args.len() != 3 {
        return Err("需要三个参数：Tauri 配置、更新归档、签名文件".into());
    }
    let config: serde_json::Value = serde_json::from_slice(&fs::read(&args[0])?)?;
    let public_key = config["plugins"]["updater"]["pubkey"]
        .as_str()
        .ok_or("缺少更新公钥")?;
    let version = config["version"].as_str().ok_or("缺少应用版本")?;
    let key_text = String::from_utf8(STANDARD.decode(public_key.trim())?)?;
    let signature_text = String::from_utf8(STANDARD.decode(fs::read_to_string(&args[2])?.trim())?)?;
    let public_key = PublicKey::decode(&key_text)?;
    let signature = Signature::decode(&signature_text)?;
    public_key.verify(&fs::read(&args[1])?, &signature, true)?;
    // Read the trusted comment only after minisign verifies its global signature.
    let signed_version = signature
        .trusted_comment()
        .split('\t')
        .find_map(|field| field.strip_prefix("version:"));
    if signed_version != Some(version) {
        return Err("签名中的版本与应用配置不一致，或签名缺少版本信息".into());
    }
    println!("更新归档签名和版本验证通过（仅使用公钥）。");
    Ok(())
}
