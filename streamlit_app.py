import streamlit as st
import requests, PyPDF2, io
import pandas as pd
from docx import Document

API_KEY = st.secrets["openrouter"]["api_key"]

def make_api_call(prompt, api_key):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Typos Streamlit App",
        "Content-Type": "application/json"
    }
    data = {
        "model": "qwen/qwen3-30b-a3b",
        "messages": [
            {"role": "system", "content": "You are a professional proofreader. Identify all typos and errors in the provided text. Respond ONLY with a markdown table with two columns: 'Typo/Error' and 'Correction'. Do not include any other commentary."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 4000
    }
    response = requests.post(url, headers=headers, json=data)
    result = response.json()
    print(result)
    return result["choices"][0]["message"]["content"]

def extract_text_from_file(uploaded_file):
    name = uploaded_file.name.lower()
    if name.endswith('.pdf'):
        try:
            pdf_reader = PyPDF2.PdfReader(uploaded_file)
            text = "\n".join(page.extract_text() or '' for page in pdf_reader.pages)
            return text
        except Exception:
            return None
    elif name.endswith('.docx'):
        try:
            doc = Document(io.BytesIO(uploaded_file.read()))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        except Exception:
            return None
    elif name.endswith('.txt'):
        try:
            return uploaded_file.read().decode("utf-8")
        except Exception:
            return None
    else:
        return None

def main():
    st.title("Text Typo Checker")
    st.write("Upload any file or paste text to find and correct typos using the Qwen model.")

    uploaded_file = st.file_uploader("Upload any file", type=None)
    text = ""
    if uploaded_file is not None:
        text = extract_text_from_file(uploaded_file)
        if not text:
            st.error("Could not extract text from this file. Please upload a text, PDF, or DOCX file.")
    else:
        text = st.text_area("Paste your text here:")
        if st.button("Proceed"):
            if not text.strip():
                st.warning("Please paste some text before proceeding.")
            else:
                if not API_KEY:
                    st.error("API key not found in secret.toml. Please add it under [openrouter] as api_key.")
                    return
                with st.spinner("Checking for typos..."):
                    try:
                        result = make_api_call(text, API_KEY)
                        st.subheader("Typos and Corrections:")
                        try:
                            df = pd.read_csv(pd.compat.StringIO(result), sep="|").iloc[:,1:-1]
                            df.columns = [col.strip() for col in df.columns]
                            st.table(df)
                        except Exception:
                            st.markdown(result)
                    except Exception as e:
                        st.error(f"Error: {e}")
    # If file was uploaded and text extracted, process automatically
    if uploaded_file is not None and text and text.strip():
        if not API_KEY:
            st.error("API key not found in secret.toml. Please add it under [openrouter] as api_key.")
            return
        with st.spinner("Checking for typos..."):
            try:
                result = make_api_call(text, API_KEY)
                st.subheader("Typos and Corrections:")
                try:
                    df = pd.read_csv(pd.compat.StringIO(result), sep="|").iloc[:,1:-1]
                    df.columns = [col.strip() for col in df.columns]
                    st.table(df)
                except Exception:
                    st.markdown(result)
            except Exception as e:
                st.error(f"Error: {e}")

if __name__ == "__main__":
    main() 