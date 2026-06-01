#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CdBd 블로그 썸네일 이미지 자동 생성
- 블로그 제목/콘텐츠에서 기능 관련 키워드 추출
- Unsplash에서 이미지 URL 생성 (API key 불필요)
- 4-10개 이미지 후보 반환
"""

import json
import re
from typing import List, Dict

# CdBd 핵심 기능 키워드 (우선순위 높음)
CDBD_KEYWORDS = {
    "프로필링크": ["profile", "link", "portfolio", "business card"],
    "카탈로그": ["catalog", "portfolio", "collection", "showcase"],
    "예약": ["booking", "reservation", "appointment", "schedule"],
    "결제": ["payment", "billing", "transaction", "checkout"],
    "초대장": ["invitation", "invite", "event", "ceremony"],
    "가이드": ["guide", "tutorial", "how-to", "instruction"],
    "명함": ["card", "business", "contact", "networking"],
    "AI": ["ai", "artificial intelligence", "automation", "smart"],
    "자동화": ["automation", "automatic", "auto", "workflow"],
    "분석": ["analytics", "analysis", "data", "insight"],
    "마케팅": ["marketing", "promotion", "campaign", "strategy"],
    "성장": ["growth", "scale", "expand", "increase"],
    "보안": ["security", "safe", "protect", "privacy"],
    "글로벌": ["global", "world", "international", "multi-language"],
    "모바일": ["mobile", "app", "phone", "responsive"],
}

# 불용어 (제외할 단어)
STOPWORDS = {
    "이", "그", "저", "것", "수", "등", "들", "및", "또는", "만", "것", "수", "등",
    "것이", "이것", "그것", "저것", "하", "되", "있", "되", "있", "같", "있", "없",
    "하다", "되다", "있다", "같다", "있다", "없다", "같다", "있다", "없다",
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "are", "was", "be", "been",
}

def extract_keywords(title: str, content: str = "") -> List[str]:
    """
    블로그 제목/콘텐츠에서 기능 관련 키워드 추출

    Args:
        title: 블로그 제목
        content: 블로그 콘텐츠 (선택)

    Returns:
        추출된 키워드 리스트 (우선순위 순)
    """
    text = f"{title} {content}".lower()
    extracted = {}

    # 1) CdBd 핵심 기능 키워드 매칭 (우선순위 높음)
    for korean, english_keywords in CDBD_KEYWORDS.items():
        for keyword in english_keywords:
            if keyword in text:
                if korean not in extracted:
                    extracted[korean] = 100  # 높은 점수
                break

    # 2) 단어 분리 (기본 토크나이징)
    # 한글: 초성·중성·종성 단위 분리
    # 영문: 공백 기준 분리
    words = re.findall(r'\b[\w가-힣]+\b', text)

    for word in words:
        if len(word) < 2 or word in STOPWORDS:
            continue

        # 이미 추출됨
        if word in extracted:
            extracted[word] += 1
            continue

        # 새로운 단어 (길이 2 이상, 빈도 기반)
        if word not in STOPWORDS:
            extracted[word] = extracted.get(word, 0) + 1

    # 점수 정렬 (내림차순)
    sorted_keywords = sorted(extracted.items(), key=lambda x: x[1], reverse=True)

    # 상위 5-8개 반환 (중복 제거)
    result = []
    for keyword, score in sorted_keywords[:8]:
        if keyword not in result:
            result.append(keyword)

    return result[:5] if len(result) > 5 else result


def generate_image_urls(keywords: List[str], count: int = 10) -> List[Dict]:
    """
    추출된 키워드로 Unsplash 이미지 URL 생성

    Args:
        keywords: 추출된 키워드 리스트
        count: 생성할 이미지 개수 (기본 10)

    Returns:
        이미지 정보 리스트
        [{
            "url": "https://source.unsplash.com/600x450?...",
            "keyword": "사용된 키워드",
            "name": "안1_keyword"
        }, ...]
    """
    results = []

    # 키워드당 2-3개 이미지 생성 (총 count개까지)
    for i, keyword in enumerate(keywords):
        if len(results) >= count:
            break

        # 기본 URL
        base_url = f"https://source.unsplash.com/600x450"

        # 변형 1: 기본 키워드
        url1 = f"{base_url}?{keyword}"
        results.append({
            "url": url1,
            "keyword": keyword,
            "name": f"안{len(results)+1}_{keyword}"
        })

        if len(results) >= count:
            break

        # 변형 2: 키워드 + 비즈니스
        url2 = f"{base_url}?{keyword}+business"
        results.append({
            "url": url2,
            "keyword": f"{keyword} (비즈니스)",
            "name": f"안{len(results)+1}_{keyword}_business"
        })

        if len(results) >= count:
            break

        # 변형 3: 키워드 + 기술
        if i < len(keywords) - 1:  # 마지막 키워드는 제외
            url3 = f"{base_url}?{keyword}+technology"
            results.append({
                "url": url3,
                "keyword": f"{keyword} (기술)",
                "name": f"안{len(results)+1}_{keyword}_tech"
            })

    return results[:count]


def generate_candidates(title: str, content: str = "", count: int = 10) -> Dict:
    """
    블로그 제목/콘텐츠 → 이미지 URL 생성 (메인 함수)

    Args:
        title: 블로그 제목
        content: 블로그 콘텐츠
        count: 생성할 이미지 개수

    Returns:
        {
            "keywords": [...],
            "images": [{...}, ...],
            "count": N
        }
    """
    # 1) 키워드 추출
    keywords = extract_keywords(title, content)

    # 2) 이미지 URL 생성
    images = generate_image_urls(keywords, count)

    return {
        "keywords": keywords,
        "images": images,
        "count": len(images)
    }


if __name__ == "__main__":
    import sys

    # 커맨드라인 사용
    if len(sys.argv) > 1:
        title = sys.argv[1]
        content = sys.argv[2] if len(sys.argv) > 2 else ""
        count = int(sys.argv[3]) if len(sys.argv) > 3 else 10

        result = generate_candidates(title, content, count)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        # 테스트
        test_title = "기업이 비공개 초대장을 고집하는 7가지 이유"
        test_content = "B2B 행사와 세미나에서 초대장의 중요성"

        result = generate_candidates(test_title, test_content, 10)
        print(json.dumps(result, ensure_ascii=False, indent=2))
