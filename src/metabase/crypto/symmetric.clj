(ns metabase.crypto.symmetric
  (:import (javax.crypto Cipher KeyGenerator SecretKey)
           (javax.crypto.spec SecretKeySpec)
           (java.security SecureRandom KeyFactory KeyPair)
           (org.apache.commons.codec.binary Base64)
           (java.nio.file Files)
           (java.io File)
           (java.security.spec PKCS8EncodedKeySpec X509EncodedKeySpec)))


;;https://stackoverflow.com/questions/10221257/is-there-an-aes-library-for-clojure
;;https://github.com/clavoie/lock-key


(defn get-bytes [s]
  (.getBytes s "UTF-8"))

(defn base64 [b]
  (Base64/encodeBase64String b))

(defn debase64 [^bytes b]
  (Base64/decodeBase64 b))

(defn get-raw-key [seed]
  (let [keygen (KeyGenerator/getInstance "AES")
        sr (SecureRandom/getInstance "SHA1PRNG")]
    (.setSeed sr (get-bytes seed))
    (.init keygen 256 sr)
    (.. keygen generateKey getEncoded)))

(defn get-cipher [mode seed]
  (let [key-spec (SecretKeySpec. (get-raw-key seed) "AES")
        cipher (Cipher/getInstance "AES")]
    (.init cipher mode key-spec)
    cipher))

;(defn encrypt [text key]
;  (println "Encrypt " (count text))
;  (let [bytes (get-bytes text)
;        cipher (get-cipher Cipher/ENCRYPT_MODE key)]
;    (base64 (.doFinal cipher bytes))))

(defn encrypt-bytes-to-b64 [the-bytes key]
  (let [cipher (get-cipher Cipher/ENCRYPT_MODE key)]
    (base64 (.doFinal cipher the-bytes))))

;(defn decrypt [text key]
;  (println "Decrypt " (count text))
;  (let [cipher (get-cipher Cipher/DECRYPT_MODE key)]
;    (String. (.doFinal cipher (debase64 text)))))

(defn decrypt-b64-bytes [^bytes b64 key]
  (println "Decrypt " (count b64))
  (let [cipher (get-cipher Cipher/DECRYPT_MODE key)]
    (.doFinal cipher (debase64 b64))))

